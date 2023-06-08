import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { RedisClientType } from 'redis';
import { config } from '../config';

export default function limiter(client: RedisClientType) {
  return rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequest,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => (isMyIP(req.ip) ? true : false),
    store: new RedisStore({
      sendCommand: (...args: string[]) => client.sendCommand(args),
    }),
  });
}

function isMyIP(ip: string) {
  return ip === '::1' || ip.endsWith('127.0.0.1');
}
