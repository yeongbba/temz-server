import Mongoose from 'mongoose';
import auth from 'auth';
import { MongoDB } from '../database/database';

const profileSchema = new Mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  image: { type: String, required: false },
  background: { type: String, required: false },
});

const userSchema = new Mongoose.Schema(
  {
    nickname: { type: String, required: true },
    profile: profileSchema,
    email: { type: String, required: true },
    domain: { type: String, required: true },
    phone: { type: String, required: true },
    wallet: { type: String, required: false },
    password: { type: String, required: true },
    isValid: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

MongoDB.useVirtualId(userSchema);
const User = Mongoose.model('User', userSchema);

export async function findByNickname(nickname: string) {
  return User.findOne({ nickname });
}

export async function findByEmail(email: string) {
  return User.findOne({ email });
}

export async function findByDomain(domain: string) {
  return User.findOne({ domain });
}

export async function findByWallet(wallet: string) {
  return User.findOne({ wallet });
}

export async function findById(id: string) {
  return User.findById(id);
}

export async function createUser(user: auth.User) {
  return new User(user).save().then((data: any) => data.id);
}
