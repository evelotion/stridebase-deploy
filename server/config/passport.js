// File: server/config/passport.js (Format ES Modules)

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './prisma.js'; // Pastikan .js ditambahkan jika Anda menggunakan ES Modules

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // URL callback harus lengkap di beberapa environment
      callbackURL: `${process.env.API_URL || ''}/api/auth/google/callback`, 
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Cek apakah user dengan googleId ini sudah ada
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (user) {
          return done(null, user);
        }

        // Jika tidak ada, cek berdasarkan email
        user = await prisma.user.findUnique({
          where: { email: profile.emails[0].value },
        });

        if (user) {
          // Jika email ada tapi googleId belum terhubung, update user
          user = await prisma.user.update({
            where: { email: profile.emails[0].value },
            data: {
              googleId: profile.id,
              emailVerified: new Date(), // Anggap email dari Google sudah terverifikasi
            },
          });
          return done(null, user);
        }

        // Jika user benar-benar baru, buat user baru
        const newUser = await prisma.user.create({
          data: {
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            password: '', // Password bisa dikosongkan karena login via Google
            role: 'pelanggan',
            emailVerified: new Date(),
          },
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;