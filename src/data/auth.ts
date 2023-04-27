import Mongoose from 'mongoose';
import { MongoDB } from '../database/mongo';
import { RefreshToken, User } from '../types/auth';

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
    email: { type: String },
    phone: { type: String, required: true },
    wallet: { type: String, required: false },
    password: { type: String, required: true },
    isDormant: { type: Boolean, required: true, default: false },
    lastLogin: { type: Date, required: true, default: Date.now },
    lastResetPassword: { type: Date, required: true, default: Date.now },
    failLoginCount: { type: Number, required: true, default: 0 },
    refreshToken: { type: String, unique: true },
  },
  { timestamps: true }
);

const nameSchema = new Mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
});

const phoneSchema = new Mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
});

MongoDB.useVirtualId(profileSchema);
MongoDB.useVirtualId(userSchema);
const UserModel = Mongoose.model('User', userSchema);
const NameModel = Mongoose.model('Name', nameSchema);
const PhoneModel = Mongoose.model('Phone', phoneSchema);

export async function createUser(user: User) {
  const userId = new Mongoose.Types.ObjectId();
  const result = await Promise.all([
    UserModel.create({ ...user, _id: userId }),
    NameModel.create({ name: user.name, _id: userId }),
    PhoneModel.create({ phone: user.phone, _id: userId }),
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

export async function updateUser(user: User, oldPhone?: string) {
  const removeOrUpdate = user.phone
    ? PhoneModel.findOneAndUpdate({ phone: oldPhone }, { phone: user.phone }, { returnOriginal: false })
    : PhoneModel.findOneAndRemove({ phone: oldPhone }, { returnOriginal: false });

  const result = await Promise.all([
    UserModel.findByIdAndUpdate(user.userId, user, { returnOriginal: false }),
    oldPhone ? removeOrUpdate : null,
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
