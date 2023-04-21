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

const nameSchema = new Mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    profile: profileSchema,
    email: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    wallet: { type: String, required: false },
    password: { type: String, required: true },
    isValid: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

const phoneSchema = new Mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    profile: profileSchema,
    email: { type: String, required: true },
    phone: { type: String, required: true, unique: true, index: true },
    wallet: { type: String, required: false },
    password: { type: String, required: true },
    isValid: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

MongoDB.useVirtualId(profileSchema);
MongoDB.useVirtualId(userSchema);
const UserModel = Mongoose.model('User', userSchema);
const NameModel = Mongoose.model('Name', nameSchema);
const PhoneModel = Mongoose.model('Phone', phoneSchema);

export async function createUser(user: User) {
  const userId = new Mongoose.Types.ObjectId();
  const result = await Promise.all([
    await UserModel.create({ ...user, _id: userId }),
    NameModel.create({ ...user, _id: userId }),
    PhoneModel.create({ ...user, _id: userId }),
  ]);
  return result[0].id;
}

export async function findByName(name: string) {
  const result = await NameModel.findOne({ name });
  return User.parse(result);
}

export async function findByPhone(phone: string) {
  const result = await PhoneModel.findOne({ phone });
  return User.parse(result);
}

export async function findById(id: string) {
  const result = await UserModel.findById(id);
  return User.parse(result);
}

// export async function findByWallet(wallet: string) {
//   const result = await UserModel.findOne({ wallet });
//   return User.parse(result);
// }

export async function updateUser(user: User, oldPhone: string) {
  const result = await Promise.all([
    UserModel.findByIdAndUpdate(user.userId, user, { returnOriginal: false }),
    NameModel.findOneAndUpdate({ name: user.name }, user, { returnOriginal: false }),
    PhoneModel.findOneAndUpdate({ phone: oldPhone }, user, { returnOriginal: false }),
  ]);
  return User.parse(result[0]);
}

export async function removeUser(user: User) {
  const result = await Promise.all([
    UserModel.findByIdAndRemove(user.userId, { returnOriginal: false }),
    NameModel.findOneAndRemove({ name: user.name }, { returnOriginal: false }),
    PhoneModel.findOneAndRemove({ phone: user.phone }, { returnOriginal: false }),
  ]);
  return User.parse(result[0]);
}
