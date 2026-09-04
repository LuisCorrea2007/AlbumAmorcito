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

interface ThinkingData {
  message?: string;
  timestamp?: string;
}

/**
 * Handle "Thinking in You" event
 * Emits real-time notification to partner with haptic feedback trigger
 */
export const handleThinkingEvent = (
  io: SocketIOServer,
  socket: Socket,
  userId: string,
  data: ThinkingData
): void => {
  logger.info(`Thinking event received from user: ${userId}`);

  // In production, fetch partner ID from database
  // For now, we'll emit to a general partner room
  // This should be replaced with actual partner lookup
  
  const eventData = {
    from: userId,
    message: data.message || '',
    timestamp: data.timestamp || new Date().toISOString(),
    type: 'thinking' as const
  };

  // Emit to partner's room (will be implemented with proper partner lookup)
  // io.to(`partner:${userId}`).emit('thinking:received', eventData);
  
  // For demo purposes, broadcast to all except sender
  socket.broadcast.emit('thinking:received', eventData);

  logger.debug(`Thinking event broadcasted from ${userId}`);

  // Acknowledge to sender
  socket.emit('thinking:acknowledged', {
    success: true,
    timestamp: eventData.timestamp
  });
};

export default handleThinkingEvent;
