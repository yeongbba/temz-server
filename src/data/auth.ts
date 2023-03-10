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
    name: { type: String, required: true, unique: true },
    profile: profileSchema,
    email: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
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
  const result = await new UserModel(user).save();
  return result.id;
}

export async function findByName(name: string) {
  const result = await UserModel.findOne({ name });
  return User.parse(result);
}

export async function findByPhone(phone: string) {
  const result = await UserModel.findOne({ phone });
  return User.parse(result);
}

export async function findById(id: string) {
  const result = await UserModel.findById(id);
  return User.parse(result);
}

export async function findByWallet(wallet: string) {
  const result = await UserModel.findOne({ wallet });
  return User.parse(result);
}

export async function updateUser(id: string, user: User) {
  const result = await UserModel.findByIdAndUpdate(id, user, { returnOriginal: false });
  return User.parse(result);
}

export async function removeUser(id: string) {
  const result = await UserModel.findByIdAndRemove(id);
  console.log(result);
}
