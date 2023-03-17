import http from 'http';
import { config } from '../config';
import { startServer } from './app';
import { MongoDB } from './database/mongo';
import { Redis } from './database/redis';

class Index {
  private _totalInfo: any;

  get totalInfo() {
    return this._totalInfo;
  }

  get server() {
    return this._totalInfo.server as http.Server;
  }

  get mongoDB() {
    return this._totalInfo.redis.rateLimitDB as MongoDB;
  }

  get rateLimitDB() {
    return this._totalInfo.redis.rateLimitDB as Redis;
  }

  get verifyCodeDB() {
    return this._totalInfo.redis.verifyCodeDB as Redis;
  }

  constructor(private port: number) {
    this.init(port);
  }

  async init(port: number) {
    this._totalInfo = await startServer(port);
  }
}

const index = new Index(config.host.port);
export default index;
