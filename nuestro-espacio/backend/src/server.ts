import App from './app';
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

async function bootstrap() {
  try {
    const app = new App();
    await app.start();
    logger.info('✅ Application started successfully');
  } catch (error) {
    logger.error('❌ Application failed to start', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    process.exit(1);
  }
}

bootstrap();
