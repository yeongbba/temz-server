import Mongoose, { Schema } from 'mongoose';
import { config } from '../../config';

export async function connectDB() {
  return Mongoose.connect(config.db.host, {
    dbName: config.db.dbName
  });
}

export function useVirtualId(schema: Schema) {
  schema.virtual('id').get(function() {
    // _id number??
    console.log(this._id);
    return (this._id as number).toString();
  });
  schema.set('toJSON', { virtuals: true });
  schema.set('toObject', { virtuals: true });
}

// TODO(Ellie): Delete blow

// let db;
// export function getTweets() {
//   return db.collection('tweets');
// }
