import { PrismaClient } from '@prisma/client';
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: process.env.LOG_FILE || 'logs/app.log' })
  ]
});

let prismaInstance: PrismaClient | null = null;

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
}).$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      const start = Date.now();
      try {
        const result = await query(args);
        const duration = Date.now() - start;
        
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Prisma Query', {
            operation,
            model,
            duration: `${duration}ms`
          });
        }
        
        return result;
      } catch (error) {
        logger.error('Prisma Query Error', {
          operation,
          model,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    }
  }
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to database', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  } catch (error) {
    logger.error('Error disconnecting database', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default prisma;
