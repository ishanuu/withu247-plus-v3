/**
 * Request/Response Logging Middleware
 * Logs all HTTP requests and responses
 */

const logger = require('../utils/logger');

// Generate request ID
const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  // Generate unique request ID
  req.id = generateRequestId();
  
  // Record start time
  const startTime = Date.now();

  // Sanitize sensitive data
  const sanitizeData = (data) => {
    if (!data) return data;
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });
    
    return sanitized;
  };

  // Log incoming request
  logger.info({
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    body: sanitizeData(req.body),
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    logger.info({
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      response: sanitizeData(data),
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    return originalJson.call(this, data);
  };

  next();
};

// Error response logging
const errorResponseLogger = (err, req, res, next) => {
  const duration = Date.now() - (req.startTime || Date.now());
  
  logger.error({
    requestId: req.id,
    method: req.method,
    path: req.path,
    statusCode: err.statusCode || 500,
    message: err.message,
    duration: `${duration}ms`,
    userId: req.user?.id,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  next(err);
};

module.exports = {
  requestLogger,
  errorResponseLogger,
  generateRequestId
};
