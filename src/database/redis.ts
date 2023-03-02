import { RedisClientType } from 'redis';
import { createClient } from 'redis';

export class Redis {
  private _client: RedisClientType;

  get client(): RedisClientType {
    return this._client;
  }

  private constructor(private url: string, private db: number) {
    this._client = createClient({ url });
    this._client.on('error', (err) => console.log('Redis Client Error', err));
    this._client.on('connect', async () => {
      await this._client.select(db);
      console.log(`Redis Database Selected ${db}`);
    });
  }

  static async createConnection(url: string, db: number) {
    const redis = new Redis(url, db);
    await redis.connect();
    return redis;
  }

  private async connect() {
    try {
      await this.client.connect();
      console.log('create redis connection successfully');
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
