/**
 * Centralized logging utility for the M3 Slice Backend API
 * Provides structured logging with timestamps and consistent formatting
 */

const logWithTimestamp = (level, message, data = null, requestId = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...(requestId && { requestId }),
    ...(data && { data })
  };
  
  // Format for console output
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}${requestId ? ` [${requestId}]` : ''}${data ? ` | ${JSON.stringify(data)}` : ''}`;
  console.log(formattedMessage);
  
  return logEntry;
};

const logger = {
  info: (message, data = null, requestId = null) => logWithTimestamp('info', message, data, requestId),
  warn: (message, data = null, requestId = null) => logWithTimestamp('warn', message, data, requestId),
  error: (message, data = null, requestId = null) => logWithTimestamp('error', message, data, requestId),
  debug: (message, data = null, requestId = null) => {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      logWithTimestamp('debug', message, data, requestId);
    }
  }
};

module.exports = logger;
