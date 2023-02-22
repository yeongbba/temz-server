import Mongoose from 'mongoose';
import auth from 'auth';
import { useVirtualId } from '../database/database';

const userSchema = new Mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  url: String,
});

useVirtualId(userSchema);
const User = Mongoose.model('User', userSchema);

export async function findByUsername(username: string) {
  return User.findOne({ username });
}

export async function findById(id: string) {
  return User.findById(id);
}

export async function createUser(user: auth.User) {
  return new User(user).save().then((data: any) => data.id);
}
