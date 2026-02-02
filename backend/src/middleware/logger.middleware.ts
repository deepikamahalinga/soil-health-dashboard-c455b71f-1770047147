// middleware/logger.ts
import { NextApiRequest, NextApiResponse } from 'next'
import pino from 'pino'
import { v4 as uuidv4 } from 'uuid'

// Configure logger based on environment
const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'yyyy-mm-dd HH:MM:ss',
    },
  },
})

interface ResponseWithMeta extends NextApiResponse {
  meta?: {
    startTime: number
    requestId: string
  }
}

export function requestLogger(
  req: NextApiRequest,
  res: ResponseWithMeta,
  next?: () => void
) {
  // Generate unique request ID
  const requestId = uuidv4()
  const startTime = Date.now()

  // Store metadata
  res.meta = {
    startTime,
    requestId,
  }

  // Log request
  logger.info({
    requestId,
    method: req.method,
    url: req.url,
    query: req.query,
    headers: req.headers,
    msg: 'Incoming request',
  })

  // Log response on finish
  res.on('finish', () => {
    const responseTime = Date.now() - startTime
    
    logger.info({
      requestId,
      statusCode: res.statusCode,
      responseTime,
      msg: 'Request completed',
    })
  })

  // Log errors
  res.on('error', (error) => {
    logger.error({
      requestId,
      error: error.message,
      stack: error.stack,
      msg: 'Request error',
    })
  })

  if (next) {
    next()
  }
}

// Helper to get request logger instance
export function getLogger(requestId?: string) {
  return logger.child({ requestId })
}

// Usage in API route
export default function withLogging(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    requestLogger(req, res)
    return handler(req, res)
  }
}