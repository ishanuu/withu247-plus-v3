/**
 * Query Optimization Utilities
 * Provides helpers for optimizing database queries
 */

/**
 * Pagination helper
 */
export const getPaginationParams = (
  page: number = 1,
  limit: number = 20
): { skip: number; take: number } => {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), 100); // Cap at 100

  return {
    skip: (validPage - 1) * validLimit,
    take: validLimit,
  };
};

/**
 * Build efficient SELECT query with field selection
 */
export const selectFields = (fields: string[]): string => {
  if (fields.length === 0) return '*';
  return fields.map((f) => `\`${f}\``).join(', ');
};

/**
 * Build WHERE clause with conditions
 */
export const buildWhereClause = (
  conditions: Record<string, any>
): { clause: string; values: any[] } => {
  const parts: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(conditions)) {
    if (value === null) {
      parts.push(`\`${key}\` IS NULL`);
    } else if (Array.isArray(value)) {
      parts.push(`\`${key}\` IN (${value.map(() => '?').join(',')})`);
      values.push(...value);
    } else if (typeof value === 'object' && value.operator) {
      // Support operators like { operator: '>', value: 100 }
      parts.push(`\`${key}\` ${value.operator} ?`);
      values.push(value.value);
    } else {
      parts.push(`\`${key}\` = ?`);
      values.push(value);
    }
  }

  return {
    clause: parts.length > 0 ? 'WHERE ' + parts.join(' AND ') : '',
    values,
  };
};

/**
 * Build ORDER BY clause
 */
export const buildOrderByClause = (
  sortBy: string,
  order: 'ASC' | 'DESC' = 'ASC'
): string => {
  const validOrder = order === 'DESC' ? 'DESC' : 'ASC';
  return `ORDER BY \`${sortBy}\` ${validOrder}`;
};

/**
 * Query result caching key generator
 */
export const generateCacheKey = (
  table: string,
  conditions: Record<string, any>,
  pagination?: { page: number; limit: number }
): string => {
  const conditionStr = JSON.stringify(conditions);
  const paginationStr = pagination ? `_p${pagination.page}_l${pagination.limit}` : '';
  return `query:${table}:${Buffer.from(conditionStr).toString('base64')}${paginationStr}`;
};

/**
 * Batch query helper
 */
export const batchQuery = <T>(items: T[], batchSize: number = 100): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
};

/**
 * Index recommendation based on query patterns
 */
export const getIndexRecommendations = (
  queryPatterns: Array<{ table: string; fields: string[] }>
): string[] => {
  const recommendations: string[] = [];

  for (const pattern of queryPatterns) {
    const indexName = `idx_${pattern.table}_${pattern.fields.join('_')}`;
    const createIndex = `CREATE INDEX ${indexName} ON ${pattern.table} (${pattern.fields.join(', ')});`;
    recommendations.push(createIndex);
  }

  return recommendations;
};

/**
 * Query performance analyzer
 */
export const analyzeQueryPerformance = (
  query: string,
  executionTime: number
): {
  isOptimal: boolean;
  suggestions: string[];
  severity: 'info' | 'warning' | 'critical';
} => {
  const suggestions: string[] = [];
  let severity: 'info' | 'warning' | 'critical' = 'info';

  // Check for SELECT *
  if (query.includes('SELECT *')) {
    suggestions.push('Avoid SELECT *, specify only needed columns');
    severity = 'warning';
  }

  // Check for missing WHERE clause on large tables
  if (!query.includes('WHERE') && !query.includes('JOIN')) {
    suggestions.push('Consider adding WHERE clause to limit result set');
    severity = 'critical';
  }

  // Check execution time
  if (executionTime > 5000) {
    suggestions.push('Query took >5s, consider optimization or indexing');
    severity = 'critical';
  } else if (executionTime > 1000) {
    suggestions.push('Query took >1s, consider optimization');
    severity = 'warning';
  }

  // Check for multiple JOINs
  const joinCount = (query.match(/JOIN/gi) || []).length;
  if (joinCount > 3) {
    suggestions.push(`Query has ${joinCount} JOINs, consider denormalization`);
    severity = 'warning';
  }

  return {
    isOptimal: suggestions.length === 0,
    suggestions,
    severity,
  };
};

/**
 * N+1 query detection helper
 */
export const detectN1Queries = (
  queries: Array<{ query: string; count: number }>
): { detected: boolean; suggestions: string[] } => {
  const suggestions: string[] = [];
  let detected = false;

  for (const q of queries) {
    if (q.count > 10) {
      suggestions.push(
        `Query "${q.query.substring(0, 50)}..." executed ${q.count} times. Consider using JOIN or batch loading.`
      );
      detected = true;
    }
  }

  return { detected, suggestions };
};

export default {
  getPaginationParams,
  selectFields,
  buildWhereClause,
  buildOrderByClause,
  generateCacheKey,
  batchQuery,
  getIndexRecommendations,
  analyzeQueryPerformance,
  detectN1Queries,
};
