const logger = require('../logger');

// Track IPs making unusual number of requests
const requestCounts = new Map();
const SUSPICIOUS_THRESHOLD = 200; // requests per minute per IP
const WINDOW_MS = 60 * 1000;

// Clean up old entries every minute
setInterval(() => requestCounts.clear(), WINDOW_MS);

const getIP = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0].trim() ||
  req.socket?.remoteAddress ||
  'unknown';

module.exports = function requestLogger(req, res, next) {
  const start = Date.now();
  const ip = getIP(req);

  // Track request count per IP
  const count = (requestCounts.get(ip) || 0) + 1;
  requestCounts.set(ip, count);

  if (count === SUSPICIOUS_THRESHOLD) {
    logger.warn({
      event: 'suspicious_traffic',
      ip,
      requests_per_minute: count,
      path: req.path,
    });
  }

  res.on('finish', () => {
    const ms = Date.now() - start;
    const logData = {
      event: 'http_request',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms,
      ip,
    };

    // Log 4xx/5xx as warnings/errors
    if (res.statusCode >= 500) logger.error(logData);
    else if (res.statusCode >= 400) logger.warn(logData);
    else logger.http(logData);
  });

  next();
};
