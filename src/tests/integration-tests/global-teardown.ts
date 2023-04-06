import Mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { createClient, RedisFlushModes } from 'redis';

dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') });

export default async function teardown() {
  try {
    await Mongoose.connect(process.env['DB_HOST'] as string, {
      dbName: process.env['DB_NAME'],
    });
    console.log('[teardown] Database connection successed');
  } catch (err) {
    console.error('Database connection failed', err);
  }

  const client = createClient({ url: process.env['REDIS_URL'] });
  try {
    await client.connect();
    await client.select(parseInt(process.env['VERIFY_CODE_DB']!));
    await client.flushDb(RedisFlushModes.ASYNC);
    console.log('[teardown] Flush Redis successed');
  } catch (err) {
    console.error('Something went wrong when cleaning the Redis', err);
  }

  const connection = Mongoose.connection;
  try {
    await connection.db.dropDatabase();
    await connection.close();
    console.log('[teardown] Drop Database successed');
  } catch (err) {
    console.error('Something went wrong when cleaning the DB', err);
  }
}
