import Mongoose from 'mongoose';
import { MongoDB } from '../database/mongo';
import { RefreshToken, User } from '../types/auth';
import { config } from '../config';
import { FollowerModel, FollowingModel } from './bookmark';

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
    refreshToken: { type: String },
  },
  { timestamps: true }
);

const nameSchema = new Mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    profile: profileSchema,
    email: { type: String },
    phone: { type: String, required: true },
    wallet: { type: String, required: false },
    password: { type: String, required: true },
    isDormant: { type: Boolean, required: true, default: false },
    lastLogin: { type: Date, required: true, default: Date.now },
    lastResetPassword: { type: Date, required: true, default: Date.now },
    failLoginCount: { type: Number, required: true, default: 0 },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

const phoneSchema = new Mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, unique: true },
});

const refreshTokenSchema = new Mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: config.jwt.refreshExpiresInSec });

MongoDB.useVirtualId(profileSchema);
MongoDB.useVirtualId(userSchema);
const UserModel = Mongoose.model('User', userSchema);
const NameModel = Mongoose.model('Name', nameSchema);
const PhoneModel = Mongoose.model('Phone', phoneSchema);
const RefreshTokenModel = Mongoose.model('RefreshToken', refreshTokenSchema);

export async function createUser(user: User) {
  const userId = new Mongoose.Types.ObjectId();
  const result = await Promise.all([
    UserModel.create({ ...user, _id: userId }),
    NameModel.create({ ...user, _id: userId }),
    PhoneModel.create({ phone: user.phone, name: user.name, _id: userId }),
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
    ? PhoneModel.findOneAndUpdate(
        { phone: oldPhone },
        { phone: user.phone, name: user.name, _id: new Mongoose.Types.ObjectId(user.userId) },
        { returnOriginal: false }
      )
    : PhoneModel.findOneAndRemove({ phone: oldPhone }, { returnOriginal: false });

  const result = await Promise.all([
    UserModel.findByIdAndUpdate(user.userId, user, { returnOriginal: false }),
    NameModel.findOneAndUpdate({ name: user.name }, user, { returnOriginal: false }),
    oldPhone ? removeOrUpdate : null,
  ]);

  const updateUser = User.parse(result[0]);
  const profileImage = user.profile?.image;
  if (profileImage !== undefined && profileImage !== updateUser.profile?.image) {
    await Promise.all([
      FollowingModel.updateMany({ followingName: user.name }, { followingImage: profileImage }),
      FollowerModel.updateMany({ followerName: user.name }, { followerImage: profileImage }),
    ]);
  }

  return updateUser;
}

export async function removeUser(user: User) {
  const result = await Promise.all([
    UserModel.findByIdAndRemove(user.userId, { returnOriginal: false }),
    NameModel.findOneAndRemove({ name: user.name }, { returnOriginal: false }),
    PhoneModel.findOneAndRemove({ phone: user.phone }, { returnOriginal: false }),
    FollowingModel.deleteMany({ followingName: user.name }),
    FollowerModel.deleteMany({ followerName: user.name }),
  ]);
  return User.parse(result[0]);
}

export async function createRefreshToken(token: string) {
  const result = await RefreshTokenModel.create({ token });
  return result.id;
}

export async function findRefreshToken(token: string) {
  const result = await RefreshTokenModel.findOne({ token });
  return RefreshToken.parse(result);
}

export async function removeRefreshToken(token) {
  const result = await RefreshTokenModel.findOneAndRemove({ token }, { returnOriginal: false });
  return RefreshToken.parse(result);
}
