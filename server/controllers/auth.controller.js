// File: server/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../config/prisma.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../email-service.js";

// --- PERUBAHAN DIMULAI DI SINI ---

// Variabel ini akan bertindak sebagai cache sederhana di memori server
// untuk melacak percobaan login yang gagal.
// Key: email, Value: { attempts: number, lastAttempt: timestamp }
const failedLoginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const COOLDOWN_PERIOD = 30 * 1000; // 30 detik dalam milidetik

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
      },
    });

    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "Pendaftaran berhasil! Silakan periksa email Anda untuk link verifikasi.",
    });
  } catch (error) {
    next(error); // Lempar error ke errorHandler
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const cooldownInfo = failedLoginAttempts.get(email);

        // 1. Cek apakah pengguna sedang dalam masa cooldown
        if (cooldownInfo && cooldownInfo.attempts >= MAX_LOGIN_ATTEMPTS && (Date.now() - cooldownInfo.lastAttempt) < COOLDOWN_PERIOD) {
            const timeLeft = Math.ceil((cooldownInfo.lastAttempt + COOLDOWN_PERIOD - Date.now()) / 1000);
            return res.status(429).json({ message: `Terlalu banyak percobaan gagal. Silakan coba lagi dalam ${timeLeft} detik.` });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.status === 'blocked') {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // 2. Jika password salah, catat percobaan gagal
            const attempts = (failedLoginAttempts.get(email)?.attempts || 0) + 1;
            failedLoginAttempts.set(email, { attempts, lastAttempt: Date.now() });

            // 3. Jika percobaan mencapai batas, catat di SecurityLog dan mulai cooldown
            if (attempts >= MAX_LOGIN_ATTEMPTS) {
                await prisma.securityLog.create({
                    data: {
                        userId: user.id,
                        action: 'LOGIN_FAILURE',
                        details: `Pengguna mencapai ${MAX_LOGIN_ATTEMPTS} kali percobaan login gagal. Cooldown 30 detik dimulai.`,
                        ipAddress: req.ip,
                    },
                });
                return res.status(429).json({ message: `Akun Anda terkunci sementara karena terlalu banyak percobaan gagal. Silakan coba lagi dalam 30 detik.` });
            }

            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        // 4. Jika login berhasil, hapus catatan percobaan gagal dari Map
        failedLoginAttempts.delete(email);
        
        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: 'Akun Anda belum diverifikasi. Silakan periksa email Anda.',
            });
        }

        const tokenPayload = { id: user.id, role: user.role };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.json({
            success: true,
            message: 'Login berhasil!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify user email
// @route   GET /api/auth/verify-email
export const verifyEmail = async (req, res, next) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).send('<h1>Token verifikasi tidak valid atau hilang.</h1>');
    }

    try {
        const user = await prisma.user.findUnique({
            where: { emailVerificationToken: token },
        });

        if (!user) {
            return res.status(400).send('<h1>Token verifikasi tidak valid atau sudah kedaluwarsa.</h1>');
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                emailVerificationToken: null,
            },
        });
        
        // Arahkan ke halaman frontend
        res.redirect('/email-verified');

    } catch (error) {
        next(error);
    }
};


// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const passwordResetExpires = new Date(Date.now() + 3600000); // 1 jam

      await prisma.user.update({
        where: { email },
        data: { resetPasswordToken: resetToken, resetPasswordExpires },
      });

      await sendPasswordResetEmail(user.email, resetToken);
    }
    
    res.status(200).json({
      success: true,
      message: "Jika email Anda terdaftar, Anda akan menerima link reset password.",
    });

  } catch (error) {
    next(error);
  }
};


// @desc    Reset password
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).json({ message: 'Token dan password baru dibutuhkan.' });
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() },
            },
        });

        if (!user) {
            return res.status(400).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });

        res.status(200).json({ success: true, message: 'Password berhasil direset. Silakan login.' });
    } catch (error) {
        next(error);
    }
};