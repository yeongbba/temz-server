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
  cookie: {
    tokenKey: required('TOKEN_KEY'),
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
    rateLimitDB: required('RATE_LIMIT_DB', 0),
    verifyCodeDB: required('VERIFY_CODE_DB', 1),
  },
  cors: {
    allowedOrigin: required('CORS_ALLOW_ORIGIN'),
  },
  csrf: {
    plainToken: required('CSRF_SECRET_KEY'),
    tokenKey: required('CSRF_TOKEN_KEY'),
  },
  rateLimit: {
    windowMs: parseInt(required('RATE_LIMIT_WINDOW_MS')),
    maxRequest: parseInt(required('RATE_LIMIT_MAX_REQUEST')),
  },
  sens: {
    hostPhone: required('SENS_HOST_PHONE'),
    serviceId: required('SENS_SERVICE_ID'),
    accessKey: required('SENS_ACCESS_KEY'),
    secretKey: required('SENS_SECRET_KEY'),
  },
  verification: {
    allowCount: parseInt(required('VERIFICATION_ALLOW_COUNT', 10)),
    generalExpireMinute: parseInt(required('VERIFICATION_GENERAL_EXPIRE_MINUTE', 180)),
    blockExpireMinute: parseInt(required('VERIFICATION_BLOCK_EXPIRE_MINUTE', 600)),
  },
  twilio: {
    accountSid: required('TWILIO_ACCOUNT_SID'),
    serviceSid: required('TWILIO_SERVICE_SID'),
    authToken: required('TWILIO_AUTH_TOKEN'),
  },
  environment: {
    test: required('IS_TEST') === 'true' ? true : false,
  },
};