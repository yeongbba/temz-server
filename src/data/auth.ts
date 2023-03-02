import Mongoose from 'mongoose';
import { MongoDB } from '../database/mongo';
import { User } from '../types/auth';

const profileSchema = new Mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  image: { type: String, required: false },
  background: { type: String, required: false },
});

const userSchema = new Mongoose.Schema(
  {
    name: { type: String, required: true },
    profile: profileSchema,
    email: { type: String, required: true },
    phone: { type: String, required: true },
    wallet: { type: String, required: false },
    password: { type: String, required: true },
    isValid: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

MongoDB.useVirtualId(profileSchema);
MongoDB.useVirtualId(userSchema);
const UserModel = Mongoose.model('User', userSchema);

export async function createUser(user: User) {
  const data = await new UserModel(user).save();
  return data.id;
}

export async function findByName(name: string) {
  const user = await UserModel.findOne({ name });
  return User.parse(user);
}

export async function findById(id: string) {
  const user = await UserModel.findById(id);
  return User.parse(user);
}

export async function findByWallet(wallet: string) {
  const user = await UserModel.findOne({ wallet });
  return User.parse(user);
}
