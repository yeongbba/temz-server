import dotenv from 'dotenv';
dotenv.config();

function required(key: string, defaultValue: any = undefined): string {
  const value = process.env[key] || defaultValue;
  if (value == null) {
    throw new Error(`Key ${key} is undefined`);
  }
  return value;
}

export const config = {
  jwt: {
    secretKey: required('JWT_SECRET'),
    expiresInSec: parseInt(required('JWT_EXPIRES_SEC', 86400)),
  },
  bcrypt: {
    saltRounds: parseInt(required('BCRYPT_SALT_ROUNDS', 12)),
  },
  host: {
    port: parseInt(required('HOST_PORT', 8080)),
  },
  db: {
    host: required('DB_HOST'),
    dbName: required('DB_NAME', 'test'),
  },
  redis: {
    url: required('REDIS_URL'),
    rateLimitDb: required('RATE_LIMIT_DB'),
  },
  cors: {
    allowedOrigin: required('CORS_ALLOW_ORIGIN'),
  },
  csrf: {
    plainToken: required('CSRF_SECRET_KEY'),
  },
  rateLimit: {
    windowMs: parseInt(required('RATE_LIMIT_WINDOW_MS')),
    maxRequest: parseInt(required('RATE_LIMIT_MAX_REQUEST')),
  },
  twilio: {
    accountSid: required('TWILIO_ACCOUNT_SID'),
    serviceSid: required('TWILIO_SERVICE_SID'),
    authToken: required('TWILIO_AUTH_TOKEN'),
  },
};
