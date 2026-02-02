// /lib/db/prisma.ts

import { PrismaClient } from '@prisma/client';
import { Logger } from './logger'; // Assume you have a logger implementation

// Custom error class for database-related errors
export class DatabaseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Connection configuration
const CONNECTION_TIMEOUT = 30_000; // 30 seconds
const POOL_CONFIG = {
  min: 2,
  max: 10,
};

// Prisma client configuration
const prismaClientConfig = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']
    : ['error'],
  errorFormat: 'minimal',
  connectionTimeout: CONNECTION_TIMEOUT,
  pool: POOL_CONFIG,
};

// Database service class
export class DatabaseService {
  private static instance: DatabaseService;
  private client: PrismaClient;
  private isConnected: boolean = false;
  private readonly logger: Logger;

  private constructor() {
    this.client = new PrismaClient(prismaClientConfig);
    this.logger = new Logger('DatabaseService');
  }

  /**
   * Get singleton instance of DatabaseService
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database connection
   */
  public async initialize(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.$connect();
        this.isConnected = true;
        this.logger.info('Database connection established');
      }
    } catch (error) {
      this.logger.error('Failed to initialize database connection', error);
      throw new DatabaseError('Database initialization failed', error);
    }
  }

  /**
   * Gracefully disconnect from database
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.$disconnect();
        this.isConnected = false;
        this.logger.info('Database connection closed');
      }
    } catch (error) {
      this.logger.error('Error disconnecting from database', error);
      throw new DatabaseError('Database disconnect failed', error);
    }
  }

  /**
   * Get Prisma client instance
   */
  public getClient(): PrismaClient {
    if (!this.isConnected) {
      throw new DatabaseError('Database is not connected');
    }
    return this.client;
  }

  /**
   * Check database health
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return false;
    }
  }

  /**
   * Execute operations within a transaction
   */
  public async transaction<T>(
    operation: (tx: PrismaClient) => Promise<T>
  ): Promise<T> {
    try {
      return await this.client.$transaction(operation);
    } catch (error) {
      this.logger.error('Transaction failed', error);
      throw new DatabaseError('Transaction failed', error);
    }
  }
}

// Create and export database instance
export const db = DatabaseService.getInstance();

// Export Prisma types
export type { PrismaClient };

// Initialization helper
export async function initializeDatabase(): Promise<void> {
  try {
    await db.initialize();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// Cleanup helper
export async function cleanupDatabase(): Promise<void> {
  try {
    await db.disconnect();
  } catch (error) {
    console.error('Error during database cleanup:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await cleanupDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanupDatabase();
  process.exit(0);
});