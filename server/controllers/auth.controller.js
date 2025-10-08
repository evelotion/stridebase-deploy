// File: server/controllers/auth.controller.js (Dengan Alur Verifikasi Baru)

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../email-service.js';
import { failedLoginAttempts, MAX_LOGIN_ATTEMPTS, COOLDOWN_PERIOD } from '../middleware/rateLimiter.js';

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const validatedRole = ['customer', 'mitra'].includes(role) ? role : 'customer';

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email sudah terdaftar.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: validatedRole,
                // --- PERUBAHAN 1: Status default kini 'pending' ---
                status: 'pending', 
            },
        });

        const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        await sendVerificationEmail(newUser, token);
        
        // Buat wallet jika role-nya adalah mitra
        if (validatedRole === 'mitra') {
            await prisma.store.create({
                data: {
                    name: `Toko ${name}`,
                    location: "Harap lengkapi alamat Anda",
                    description: "Harap lengkapi deskripsi toko Anda.",
                    ownerId: newUser.id,
                    storeStatus: "pending", 
                    tier: "BASIC",
                    commissionRate: 10.0,
                    images: [],
                    wallet: {
                        create: {}
                    }
                }
            });
        }
        
        res.status(201).json({ 
            message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi akun.' 
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Login a user
// @route   POST /api/auth/login
export const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    const attempts = failedLoginAttempts.get(email) || 0;
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
        return res.status(429).json({ message: `Terlalu banyak percobaan login. Silakan coba lagi dalam ${COOLDOWN_PERIOD / 60000} menit.` });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        // --- PERUBAHAN 3: Hanya user dengan status 'active' yang bisa login ---
        if (!user || user.status !== 'active') {
            failedLoginAttempts.set(email, (attempts + 1));
            setTimeout(() => failedLoginAttempts.delete(email), COOLDOWN_PERIOD);
            return res.status(401).json({ message: 'Email atau password salah, atau akun belum aktif.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            failedLoginAttempts.set(email, (attempts + 1));
            setTimeout(() => failedLoginAttempts.delete(email), COOLDOWN_PERIOD);
            return res.status(401).json({ message: 'Email atau password salah.' });
        }
        
        failedLoginAttempts.delete(email);
        
        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: 'Akun Anda belum diverifikasi. Silakan periksa email Anda.',
            });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Verify user's email
// @route   GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res, next) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user) {
            return res.status(400).send("Token verifikasi tidak valid atau pengguna tidak ditemukan.");
        }
        
        if(user.isEmailVerified){
             return res.redirect('/login?message=Email sudah diverifikasi sebelumnya. Silakan login.');
        }

        await prisma.user.update({
            where: { id: user.id },
            // --- PERUBAHAN 2: Update status menjadi 'active' saat verifikasi ---
            data: { isEmailVerified: true, status: 'active' },
        });

        res.redirect('/email-verified');
    } catch (error) {
        res.status(400).send("Link verifikasi tidak valid atau telah kedaluwarsa.");
    }
};

// ... (sisa fungsi seperti logoutUser, forgotPassword, dll. tidak perlu diubah) ...

// @desc    Logout a user
// @route   POST /api/auth/logout
export const logoutUser = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logout berhasil.' });
};


// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User dengan email tersebut tidak ditemukan.' });
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await sendPasswordResetEmail(user, token);
        res.json({ message: 'Email untuk reset password telah dikirim.' });
    } catch (error) {
        next(error);
    }
};


// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
export const resetPassword = async (req, res, next) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: decoded.userId },
            data: { password: hashedPassword }
        });
        res.json({ message: 'Password berhasil direset. Silakan login dengan password baru.' });
    } catch (error) {
        res.status(400).json({ message: 'Token tidak valid atau telah kedaluwarsa.' });
    }
};


// @desc    Get current user profile
// @route   GET /api/auth/profile
export const getProfile = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });

        if (!user) {
            return res.status(404).json({ message: "Pengguna tidak ditemukan." });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};