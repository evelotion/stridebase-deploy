// File: server/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../config/prisma.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../email-service.js";

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
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.status === 'blocked') {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

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