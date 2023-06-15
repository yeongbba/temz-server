import dotenv from 'dotenv';
dotenv.config();

function required(key: string, defaultValue: any = undefined): string {
  const value = process.env[key] || defaultValue;
  console.log(value);
  if (value == null) {
    throw new Error(`Key ${key} is undefined`);
  }
  return value;
}

export const config = {
  jwt: {
    accessSecretKey: required('ACCESS_SECRET'),
    refreshSecretKey: required('REFRESH_SECRET'),
    accessExpiresInSec: parseInt(required('ACCESS_EXPIRES_SEC', 86400)),
    refreshExpiresInSec: parseInt(required('REFRESH_EXPIRES_SEC', 604800)),
  },
  cookie: {
    accessTokenKey: required('ACCESS_TOKEN_KEY'),
    refreshTokenKey: required('REFRESH_TOKEN_KEY'),
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
  environment: {
    test: required('IS_TEST') === 'true' ? true : false,
  },
};
