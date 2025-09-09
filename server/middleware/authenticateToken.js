// File: server/middleware/authenticateToken.js
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan." });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(403).json({ message: "Token tidak valid atau kedaluwarsa." });
    }
    
    try {
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || user.status === 'blocked') {
        return res.status(403).json({ message: "Akses ditolak untuk pengguna ini." });
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
  });
};

// Middleware tambahan untuk memeriksa peran
export const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Akses ditolak. Membutuhkan peran: ${roles.join(' atau ')}.` });
  }
  next();
};