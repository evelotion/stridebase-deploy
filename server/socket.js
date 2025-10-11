// File: server/socket.js

import { Server } from "socket.io";
import prisma from "./config/prisma.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(userId);
      console.log(`Socket.IO: User ${userId} connected and joined room.`);
    } else {
      console.log("Socket.IO: An anonymous user connected:", socket.id);
    }

    socket.on("disconnect", () => {
      console.log("Socket.IO: User disconnected:", socket.id);
    });
  });

  console.log("Socket.IO initialized successfully.");
  return io;
};

export const createNotificationForUser = async (userId, message, link) => {
  if (io && userId) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          message,
          linkUrl: link,
        },
      });
      io.to(userId).emit("new_notification", notification);
    } catch (error) {
      console.error("Failed to create notification:", error);
    }
  }
};

// FUNGSI BARU DITAMBAHKAN DI SINI
export const broadcastThemeUpdate = (newTheme) => {
  if (io) {
    io.emit("themeUpdated", newTheme);
    console.log("Broadcasting theme update to all clients.");
  }
};

export { io };