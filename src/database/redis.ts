import { RedisClientType } from 'redis';
import { createClient } from 'redis';

export class Redis {
  static pool = {};
  private _client: RedisClientType;

  get client(): RedisClientType {
    return this._client;
  }

  private constructor(private url: string) {
    this._client = createClient({ url });
    this._client.on('error', (err) => console.log('Redis Client Error', err));
  }

  static async createConnection(url: string, db: number) {
    const redis = new Redis(url);
    await redis.connect(db);
    this.pool[db] = redis;
    return redis;
  }

  private async connect(db: number) {
    try {
      await this.client.connect();
      await this.client.select(db);
      console.log(`create redis connection successfully, database ${db}`);
    } catch (err) {
      console.error(err);
    }
  }

  async close() {
    try {
      await this.client.disconnect();
      this._client = null;
      console.log('close redis connection successfully');
    } catch (err) {
      console.error(err);
    }
  }
}
