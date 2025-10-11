// File: server/socket.js (Perbaikan Final & Best Practice)

import { Server } from "socket.io";
import prisma from "./config/prisma.js";

let io;

// Fungsi ini menginisialisasi dan mengatur server Socket.IO
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket.IO: User connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Socket.IO: User disconnected:", socket.id);
    });
  });

  console.log("Socket.IO initialized successfully.");
  return io;
};

// Fungsi ini digunakan di bagian lain aplikasi untuk membuat notifikasi
export const createNotificationForUser = async (userId, message, link) => {
  if (io) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          message,
          link,
        },
      });
      // Mengirim notifikasi ke user tertentu melalui socket
      io.emit("notification", { userId, ...notification });
    } catch (error) {
      console.error("Failed to create notification:", error);
    }
  }
};

// Ekspor instance 'io' agar bisa diimpor di tempat lain
export { io };
