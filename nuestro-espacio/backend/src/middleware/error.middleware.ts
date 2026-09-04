import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation error', code?: string) {
    super(message, 400, code || 'VALIDATION_ERROR');
  }
}

export const errorMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If headers already sent, pass to next error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    });
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    switch (prismaError.code) {
      case 'P2002': // Unique constraint failed
        res.status(409).json({
          success: false,
          error: {
            message: 'A record with this value already exists',
            code: 'UNIQUE_CONSTRAINT'
          }
        });
        break;
      case 'P2025': // Record not found
        res.status(404).json({
          success: false,
          error: {
            message: 'Record not found',
            code: 'NOT_FOUND'
          }
        });
        break;
      default:
        res.status(400).json({
          success: false,
          error: {
            message: 'Database error',
            code: 'DATABASE_ERROR'
          }
        });
    }
    return;
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    const multerError = err as any;
    res.status(400).json({
      success: false,
      error: {
        message: `File upload error: ${multerError.message}`,
        code: 'UPLOAD_ERROR'
      }
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        code: 'TOKEN_ERROR'
      }
    });
    return;
  }

  // Unknown/internal server error
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'development' 
        ? err.message 
        : 'Internal server error',
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
