// types/error.ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// middleware/errorHandler.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AppError } from '../types/error';

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    stack?: string;
  };
}

export const errorHandler = (
  err: Error | AppError,
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse>
) => {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let isOperational = false;

  // Handle known error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    code = 'VALIDATION_ERROR';
    isOperational = true;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
    code = 'UNAUTHORIZED';
    isOperational = true;
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      code,
      // Only include stack trace in development
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Helper functions for common errors
export const createNotFoundError = (resource: string) => {
  return new AppError(`${resource} not found`, 404);
};

export const createValidationError = (message: string) => {
  return new AppError(message, 400);
};

export const createUnauthorizedError = () => {
  return new AppError('Unauthorized', 401);
};

export const createForbiddenError = () => {
  return new AppError('Forbidden', 403);
};

// Usage in API route
// pages/api/example.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { errorHandler } from '../../middleware/errorHandler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Your API logic here
    throw createNotFoundError('User');
  } catch (error) {
    errorHandler(error as Error, req, res);
  }
}

// Utility to wrap API handlers with error handling
export const withErrorHandling = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      errorHandler(error as Error, req, res);
    }
  };
};

// Example usage with wrapper
export default withErrorHandling(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Your API logic here
});