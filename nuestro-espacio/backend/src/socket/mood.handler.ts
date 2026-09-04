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

interface MoodData {
  value: number;
  color?: string;
  note?: string;
}

/**
 * Handle Mood Update event
 * Broadcasts mood change to partner in real-time
 */
export const handleMoodEvent = (
  io: SocketIOServer,
  socket: Socket,
  userId: string,
  data: MoodData
): void => {
  logger.info(`Mood update received from user: ${userId}`, { 
    value: data.value, 
    color: data.color 
  });

  const moodData = {
    userId,
    value: data.value,
    color: data.color || '#FF6B6B',
    note: data.note || '',
    timestamp: new Date().toISOString()
  };

  // Broadcast to partner
  socket.broadcast.emit('mood:updated', moodData);

  logger.debug(`Mood update broadcasted from ${userId}`);

  // Acknowledge to sender
  socket.emit('mood:acknowledged', {
    success: true,
    ...moodData
  });
};

export default handleMoodEvent;
