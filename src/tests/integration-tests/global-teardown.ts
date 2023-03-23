import Mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') });

export default async function teardown() {
  try {
    await Mongoose.connect(process.env['DB_HOST'], {
      dbName: process.env['DB_NAME'],
    });
    console.log('[teardown] Database connection successed');
  } catch (err) {
    console.error('Database connection failed', err);
  }

  const connection = Mongoose.connection;
  try {
    await connection.db.dropDatabase();
    console.log('[teardown] Drop Database successed');
  } catch (err) {
    console.error('Something went wrong when cleaning the DB', err);
  } finally {
    connection.close();
  }
}
