// types/health.ts
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    latency: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  version: string;
}

// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { HealthCheckResponse } from '@/types/health';

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    // Check database connection
    const dbStartTime = Date.now();
    const dbClient = await pool.connect();
    const dbLatency = Date.now() - dbStartTime;
    dbClient.release();

    // Get memory usage
    const usedMemory = process.memoryUsage().heapUsed;
    const totalMemory = process.memoryUsage().heapTotal;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    const healthCheck: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: 'connected',
        latency: dbLatency,
      },
      memory: {
        used: Math.round(usedMemory / 1024 / 1024), // Convert to MB
        total: Math.round(totalMemory / 1024 / 1024), // Convert to MB
        percentage: Math.round(memoryPercentage * 100) / 100,
      },
      version: process.env.npm_package_version || '1.0.0',
    };

    return res.status(200).json(healthCheck);

  } catch (error) {
    const unhealthyResponse: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: 'disconnected',
        latency: 0,
      },
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
      version: process.env.npm_package_version || '1.0.0',
    };

    console.error('Health check failed:', error);
    return res.status(503).json(unhealthyResponse);
  }
}

// utils/healthCheck.ts
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    return false;
  }
}

export function getMemoryUsage(): { used: number; total: number; percentage: number } {
  const used = process.memoryUsage().heapUsed;
  const total = process.memoryUsage().heapTotal;
  const percentage = (used / total) * 100;

  return {
    used: Math.round(used / 1024 / 1024),
    total: Math.round(total / 1024 / 1024),
    percentage: Math.round(percentage * 100) / 100,
  };
}