// File: server/controllers/auth.controller.js (Kode Lengkap Final)

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../email-service.js";
import {
  failedLoginAttempts,
  MAX_LOGIN_ATTEMPTS,
  COOLDOWN_PERIOD,
} from "../middleware/rateLimiter.js";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
      },
    });

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      message:
        "Registrasi berhasil. Silakan cek email Anda untuk verifikasi.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const ip = req.ip;

  if (
    failedLoginAttempts[ip] &&
    failedLoginAttempts[ip].count >= MAX_LOGIN_ATTEMPTS
  ) {
    const timeSinceLastAttempt = Date.now() - failedLoginAttempts[ip].lastAttempt;
    if (timeSinceLastAttempt < COOLDOWN_PERIOD) {
      return res.status(429).json({
        message:
          "Terlalu banyak percobaan login. Silakan coba lagi dalam beberapa saat.",
      });
    } else {
      delete failedLoginAttempts[ip];
    }
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        if (!failedLoginAttempts[ip]) failedLoginAttempts[ip] = { count: 0, lastAttempt: 0 };
        failedLoginAttempts[ip].count++;
        failedLoginAttempts[ip].lastAttempt = Date.now();
        return res.status(401).json({ message: "Email atau password salah." });
    }
    
    if (!user.isVerified) {
        return res.status(401).json({ message: "Akun Anda belum diverifikasi. Silakan cek email Anda." });
    }
    
    if (user.status !== 'active') {
        return res.status(403).json({ message: `Status akun Anda saat ini: ${user.status}. Tidak dapat login.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        if (!failedLoginAttempts[ip]) failedLoginAttempts[ip] = { count: 0, lastAttempt: 0 };
        failedLoginAttempts[ip].count++;
        failedLoginAttempts[ip].lastAttempt = Date.now();
        return res.status(401).json({ message: "Email atau password salah." });
    }
    
    delete failedLoginAttempts[ip];

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
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

/**
 * @desc    Login for Superuser (Admin/Developer)
 * @route   POST /api/auth/superuser-login
 * @access  Public
 */
export const superuserLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || (user.role !== "admin" && user.role !== "developer")) {
      return res
        .status(403)
        .json({ message: "Akses ditolak. Akun bukan admin atau developer." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" } // Sesi lebih pendek untuk superuser
    );

    res.json({
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

/**
 * @desc    Verify user email
 * @route   GET /api/auth/verify-email
 * @access  Public
 */
export const verifyEmail = async (req, res, next) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send("Token verifikasi tidak ditemukan.");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { email: decoded.email } });

    if (!user) {
      return res.status(400).send("Token tidak valid atau pengguna tidak ditemukan.");
    }

    if (user.isVerified) {
      return res.status(200).send("Email sudah diverifikasi sebelumnya.");
    }
    
    if (user.emailVerificationToken !== token) {
        return res.status(400).send("Token tidak valid atau sudah kedaluwarsa.");
    }

    await prisma.user.update({
      where: { email: decoded.email },
      data: { isVerified: true, emailVerificationToken: null },
    });

    res.redirect(`${process.env.CLIENT_URL}/email-verified`);
  } catch (error) {
    next(new Error("Token verifikasi tidak valid atau sudah kedaluwarsa."));
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email }});
        if (!user) {
            // Respon generik untuk keamanan
            return res.status(200).json({ message: 'Jika email terdaftar, link reset password akan dikirim.' });
        }

        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await prisma.user.update({
            where: { email },
            data: { passwordResetToken: resetToken }
        });

        await sendPasswordResetEmail(email, resetToken);
        
        res.status(200).json({ message: 'Jika email terdaftar, link reset password akan dikirim.' });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token dan password baru dibutuhkan.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user || user.passwordResetToken !== token) {
            return res.status(400).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
            }
        });

        res.status(200).json({ message: 'Password berhasil direset.' });

    } catch (error) {
        next(new Error("Gagal mereset password. Token mungkin tidak valid."));
    }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
    const { name } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { name },
            select: { id: true, name: true, email: true, role: true }
        });
        res.json({ message: 'Profil berhasil diperbarui.', user });
    } catch (error) {
        next(error);
    }
};