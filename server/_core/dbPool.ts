/**
 * Database Connection Pooling
 * Manages connection pool for optimal database performance
 */

import mysql from 'mysql2/promise';
import type { Pool, PoolConnection } from 'mysql2/promise';

let pool: mysql.Pool | null = null;

/**
 * Initialize database connection pool
 */
export const initializePool = async (): Promise<mysql.Pool> => {
  if (pool) {
    return pool;
  }

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'withu247',
      
      // Connection pool settings
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_POOL_MAX || '10'),
      queueLimit: parseInt(process.env.DB_POOL_QUEUE || '0'),
      
      // Connection settings
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      
      // Timeout settings
      connectTimeout: 10000,
      
      // SSL settings (for production)
      ssl: process.env.DB_SSL === 'true' ? {} : undefined,
    });

    // Test connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    console.log('✅ Database connection pool initialized');
    return pool;
  } catch (error) {
    console.error('❌ Failed to initialize database connection pool:', error);
    throw error;
  }
};

/**
 * Get connection from pool with retry logic
 */
export const getConnection = async (retries: number = 3): Promise<mysql.PoolConnection> => {
  if (!pool) {
    throw new Error('Connection pool not initialized');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await pool.getConnection();
      return connection;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      // Exponential backoff
      const delay = Math.pow(2, attempt - 1) * 100;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Failed to get database connection');
};

/**
 * Execute query with connection pooling
 */
export const executeQuery = async <T = any>(
  query: string,
  values?: any[]
): Promise<T[]> => {
  const connection = await getConnection();

  try {
    const [rows] = await connection.execute(query, values);
    return rows as T[];
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Execute query and get single result
 */
export const executeQuerySingle = async <T = any>(
  query: string,
  values?: any[]
): Promise<T | null> => {
  const results = await executeQuery<T>(query, values);
  return results.length > 0 ? results[0] : null;
};

/**
 * Execute transaction
 */
export const executeTransaction = async <T = any>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> => {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Get pool statistics
 */
export const getPoolStats = (): {
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
} | null => {
  if (!pool) {
    return null;
  }

  return {
    activeConnections: (pool as any)._activeConnections?.length || 0,
    idleConnections: (pool as any)._freeConnections?.length || 0,
    waitingRequests: (pool as any)._waitingCallbacks?.length || 0,
  };
};

/**
 * Drain pool and close connections
 */
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection pool closed');
  }
};

/**
 * Health check for database connection
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    const connection = await getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

export default {
  initializePool,
  getConnection,
  executeQuery,
  executeQuerySingle,
  executeTransaction,
  getPoolStats,
  closePool,
  healthCheck,
};
