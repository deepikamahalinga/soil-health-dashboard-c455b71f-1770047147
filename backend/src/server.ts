import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { cors } from '@/lib/cors';
import { validateRequest } from '@/lib/validate';
import { handleError } from '@/lib/error-handler';
import { config } from '@/config';

// Validation schemas
const searchParamsSchema = z.object({
  state: z.string().optional(),
  district: z.string().optional(), 
  village: z.string().optional()
});

// Rate limiting config
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
  max: 20 // Max 20 requests per minute
});

// Global middleware
export const middleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    // CORS
    await cors(req, res);

    // Rate limiting
    await limiter.check(res, req, 20);

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Request validation
    if (req.body) {
      await validateRequest(req);
    }

    // Continue
    next();
  } catch (error) {
    handleError(error, res);
  }
};

// Health check endpoint
export const healthCheck = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    
    res.status(200).json({ status: 'healthy' });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(500).json({ status: 'unhealthy' });
  }
};

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  try {
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Initialize services
const init = async () => {
  try {
    await prisma.$connect();
    await redis.connect();
    logger.info('Services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
};

init();

export default {
  middleware,
  healthCheck
};