import { connect, ObjectId, Schema, set } from 'mongoose';
import { config } from '../../config';

export async function connectDB() {
  set('strictQuery', true);
  return connect(config.db.host, {
    dbName: config.db.dbName,
  });
}

export function useVirtualId(schema: Schema) {
  schema.virtual('id').get(function () {
    return (this._id as ObjectId).toString();
  });
  schema.set('toJSON', { virtuals: true });
  schema.set('toObject', { virtuals: true });
}

// TODO(Ellie): Delete blow

// let db;
// export function getTweets() {
//   return db.collection('tweets');
// }
