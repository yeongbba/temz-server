import http from 'http';
import { MongoDB } from '../database/mongo';
import { Redis } from '../database/redis';

export type ServerInfo = {
  server: http.Server;
  db: MongoDB;
  redis: {
    rateLimitDB: Redis;
    verifyCodeDB: Redis;
  };
};
