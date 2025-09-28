// File: server/socket.js (Dengan Perbaikan Ekspor)

import { Server } from "socket.io";
import prisma from "./config/prisma.js";

let io;

export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://stridebase-client-ctct.onrender.com",
      ],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ Pengguna terhubung: ${socket.id}`);
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(userId);
      console.log(`Socket ${socket.id} bergabung ke room untuk pengguna ${userId}`);
    }
    socket.on("disconnect", () => {
      console.log(`❌ Pengguna terputus: ${socket.id}`);
    });
  });

  return io;
};

export const createNotificationForUser = async (userId, message, linkUrl = null, bookingId = null) => {
  if (!io) return;
  try {
    const notification = await prisma.notification.create({
      data: { userId, message, linkUrl, bookingId },
    });
    io.to(userId).emit("new_notification", notification);
    console.log(`Notifikasi terkirim untuk pengguna ${userId}: ${message}`);
  } catch (error) {
    console.error(`Gagal membuat notifikasi untuk pengguna ${userId}:`, error);
  }
};

export const broadcastThemeUpdate = (newTheme) => {
    if (!io) return;
    io.emit("themeUpdated", newTheme);
    console.log("🚀 Pembaruan tema disiarkan ke semua klien.");
};

export { io }; // <-- TAMBAHKAN BARIS INI