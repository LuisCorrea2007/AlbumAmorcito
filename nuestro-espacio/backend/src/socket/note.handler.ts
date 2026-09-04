import { Server as SocketIOServer, Socket } from 'socket.io';
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

/**
 * Handle Note events (create, update, delete)
 * Enables real-time collaboration on notes
 */
export const handleNoteEvent = (
  io: SocketIOServer,
  socket: Socket,
  userId: string,
  action: 'create' | 'update' | 'delete',
  data: any
): void => {
  logger.info(`Note ${action} event received from user: ${userId}`, {
    action,
    noteId: data.noteId
  });

  const eventData = {
    action,
    userId,
    data,
    timestamp: new Date().toISOString()
  };

  // Broadcast to partner for real-time sync
  socket.broadcast.emit('note:sync', eventData);

  logger.debug(`Note ${action} broadcasted from ${userId}`);

  // Acknowledge to sender
  socket.emit('note:acknowledged', {
    success: true,
    action,
    ...eventData
  });
};

export default handleNoteEvent;
