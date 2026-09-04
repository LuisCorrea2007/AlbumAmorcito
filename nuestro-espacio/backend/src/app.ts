import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import winston from 'winston';
import { connectDatabase, disconnectDatabase, prisma } from './prisma';
import routes from './routes';
import { initSocket } from './socket';
import { errorMiddleware } from './middleware/error.middleware';
import { initCapsuleCron } from './utils/cron.util';

// Load environment variables
dotenv.config();

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

class App {
  public app: Application;
  private server: HTTPServer | null = null;
  private io: SocketIOServer | null = null;
  private readonly port: number = parseInt(process.env.PORT || '3000', 10);
  private readonly host: string = process.env.HOST || 'localhost';

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable for development
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static files (uploads)
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.app.use('/uploads', express.static(path.resolve(uploadDir)));

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Nuestro Espacio API',
        version: '1.0.0',
        description: 'Self-hosted backend for couples ecosystem',
        endpoints: {
          health: '/health',
          api: '/api',
          socket: '/socket.io/'
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();

      // Create HTTP server
      this.server = this.app.listen(this.port, this.host, () => {
        logger.info(`Server running on http://${this.host}:${this.port}`);
      });

      // Initialize Socket.io
      if (this.server) {
        this.io = initSocket(this.server);
        logger.info('Socket.io initialized');
      }

      // Initialize cron jobs (time capsules)
      initCapsuleCron(prisma, this.io);
      logger.info('Cron jobs initialized');

      // Graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('Failed to start server', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      if (this.server) {
        this.server.close(async () => {
          logger.info('HTTP server closed');
          await disconnectDatabase();
          process.exit(0);
        });

        // Force close after 10 seconds
        setTimeout(() => {
          logger.error('Forced shutdown due to timeout');
          process.exit(1);
        }, 10000);
      } else {
        await disconnectDatabase();
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error: error.message });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection', { reason });
      process.exit(1);
    });
  }

  public getApp(): Application {
    return this.app;
  }

  public getIO(): SocketIOServer | null {
    return this.io;
  }
}

export default App;
