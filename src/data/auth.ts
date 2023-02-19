import { User } from 'auth';
import { model, Schema } from 'mongoose';
import { useVirtualId } from '../database/database';

const userSchema = new Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  url: String,
});

useVirtualId(userSchema);
const User = model('User', userSchema);

export async function findByUsername(username: string) {
  return User.findOne({ username });
}

export async function findById(id: string) {
  return User.findById(id);
}

export async function createUser(user: User) {
  return new User(user).save().then((data: any) => data.id);
}
