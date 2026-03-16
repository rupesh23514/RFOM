import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "http://localhost:5173",
        "http://localhost:3000",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Allow clients to join a room for their restaurant (owner) or user (customer)
    socket.on("join-restaurant", (restaurantId: string) => {
      socket.join(`restaurant-${restaurantId}`);
      console.log(`[Socket.IO] ${socket.id} joined room restaurant-${restaurantId}`);
    });

    socket.on("join-user", (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`[Socket.IO] ${socket.id} joined room user-${userId}`);
    });

    // Allow delivery partners to join the delivery room for new order notifications
    socket.on("join-delivery", () => {
      socket.join("delivery");
      console.log(`[Socket.IO] ${socket.id} joined room delivery`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO not initialized! Call initSocket first.");
  }
  return io;
};
