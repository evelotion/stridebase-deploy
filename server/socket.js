

import { Server } from "socket.io";
import prisma from "./config/prisma.js";

let io;


const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
     
      origin: (origin, callback) => {
       
        if (!origin) return callback(null, true);

       
        if (allowedOrigins.includes(origin)) return callback(null, true);

       
        const isLocalNetwork =
          /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/.test(origin) ||
          /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/.test(origin) ||
          /^http:\/\/172\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/.test(origin);

        if (isLocalNetwork) {
          return callback(null, true);
        }

        console.log("🚫 Socket.IO Blocked Origin:", origin);
        callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(userId);
      console.log(`✅ Socket.IO: User ${userId} connected.`);
    } else {
     
      console.log(`✅ Socket.IO: Anonymous connected (${socket.id})`);
    }

    socket.on("disconnect", () => {
     
    });
  });

  console.log("🚀 Socket.IO initialized successfully.");
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io belum diinisialisasi!");
  }
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

export const broadcastThemeUpdate = (newTheme) => {
  if (io) {
    io.emit("themeUpdated", newTheme);
    console.log("Broadcasting theme update to all clients.");
  }
};

export { io };