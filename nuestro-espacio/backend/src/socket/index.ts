import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';
import winston from 'winston';
import { handleThinkingEvent } from './thinking.handler';
import { handleMoodEvent } from './mood.handler';
import { handleNoteEvent } from './note.handler';
import { handleSyncEvent } from './sync.handler';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

// Store connected users: userId -> socketId
const connectedUsers = new Map<string, string>();
// Store partner connections: userId -> partnerId
const userPartners = new Map<string, string>();

export const initSocket = (server: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: process.env.SOCKET_PATH || '/socket.io/',
    transports: (process.env.SOCKET_TRANSPORTS || 'websocket,polling').split(',')
  });

  // Middleware for authentication
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    const userId = socket.handshake.auth.userId;

    if (!userId) {
      logger.warn('Socket connection rejected: missing userId');
      return next(new Error('Authentication error: userId required'));
    }

    // In production, verify JWT token here
    // For now, we accept the connection with userId
    socket.data.userId = userId;
    logger.debug(`Socket authenticated: ${userId}`);
    next();
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string;
    logger.info(`User connected: ${userId}, Socket ID: ${socket.id}`);

    // Store connection
    connectedUsers.set(userId, socket.id);

    // Join user's personal room
    socket.join(`user:${userId}`);
    logger.debug(`User ${userId} joined room user:${userId}`);

    // ================================
    // Thinking in You Event
    // ================================
    socket.on('thinking:send', (data: { message?: string }) => {
      handleThinkingEvent(io, socket, userId, data);
    });

    // ================================
    // Mood Update Event
    // ================================
    socket.on('mood:update', (data: { value: number; color?: string; note?: string }) => {
      handleMoodEvent(io, socket, userId, data);
    });

    // ================================
    // Note Events (real-time collaboration)
    // ================================
    socket.on('note:create', (data: any) => {
      handleNoteEvent(io, socket, userId, 'create', data);
    });

    socket.on('note:update', (data: any) => {
      handleNoteEvent(io, socket, userId, 'update', data);
    });

    socket.on('note:delete', (data: { noteId: string }) => {
      handleNoteEvent(io, socket, userId, 'delete', data);
    });

    // ================================
    // Sync Events (offline-first)
    // ================================
    socket.on('sync:request', (data: { entityType: string; lastSyncedAt?: string }) => {
      handleSyncEvent(io, socket, userId, data);
    });

    socket.on('sync:push', (data: { operations: any[] }) => {
      handleSyncEvent(io, socket, userId, data);
    });

    // ================================
    // Connection Management
    // ================================
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${userId}, Reason: ${reason}`);
      connectedUsers.delete(userId);
      socket.leave(`user:${userId}`);
    });

    socket.on('connect_error', (error) => {
      logger.error(`Socket connection error for ${userId}:`, error.message);
    });
  });

  // Helper method to get partner's socket room
  io.getPartnerRoom = (userId: string): string | null => {
    const partnerId = userPartners.get(userId);
    return partnerId ? `user:${partnerId}` : null;
  };

  // Helper method to check if user is online
  io.isUserOnline = (userId: string): boolean => {
    return connectedUsers.has(userId);
  };

  logger.info('Socket.io server initialized');
  return io;
};

// Extend SocketIOServer type to include helper methods
declare module 'socket.io' {
  interface Server {
    getPartnerRoom: (userId: string) => string | null;
    isUserOnline: (userId: string) => boolean;
  }
}

export default initSocket;
