import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.utils';
import User from '../models/User.model';
import logger from '../utils/logger';
import { buildUserRoom, buildAdminRoom, buildPublicRoom } from './events';

let io: Server;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (token) {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          (socket as Socket & { userId?: string; userRole?: string }).userId = user._id.toString();
          (socket as Socket & { userId?: string; userRole?: string }).userRole = user.role;
        }
      }
      next();
    } catch {
      // Allow unauthenticated connections for public rooms
      next();
    }
  });

  io.on('connection', (socket: Socket & { userId?: string; userRole?: string }) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join public room
    socket.join(buildPublicRoom());

    // Join user-specific room if authenticated
    if (socket.userId) {
      socket.join(buildUserRoom(socket.userId));
      logger.info(`User ${socket.userId} joined their room`);

      // Join admin room if admin
      if (socket.userRole === 'admin' || socket.userRole === 'super_admin') {
        socket.join(buildAdminRoom());
        logger.info(`Admin ${socket.userId} joined admin room`);
      }
    }

    // Handle joining specific rooms
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
    });

    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};