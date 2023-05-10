import Mongoose from 'mongoose';
import { MongoDB } from '../database/mongo';
import { Filter } from '../types/common';
import { Bookmark } from '../types/bookmark';

const followingSchema = new Mongoose.Schema(
  {
    userId: { type: String, required: true },
    followingId: { type: String, required: true },
    followingName: { type: String, required: true },
    followingImage: { type: String },
  },
  { timestamps: true }
);

const followerSchema = new Mongoose.Schema(
  {
    userId: { type: String, required: true },
    followerId: { type: String, required: true },
    followerName: { type: String, required: true },
    followerImage: { type: String },
  },
  { timestamps: true }
);

followingSchema.index({ followingName: 1, userId: 1 }, { unique: true });
followerSchema.index({ followerName: 1, userId: 1 }, { unique: true });

MongoDB.useVirtualId(followingSchema);
MongoDB.useVirtualId(followerSchema);
export const FollowingModel = Mongoose.model('Following', followingSchema);
export const FollowerModel = Mongoose.model('Follower', followerSchema);

export async function createBookmark(bookmark: Bookmark) {
  const result = await Promise.all([
    FollowingModel.create({
      userId: bookmark.userId,
      followingName: bookmark.followingName,
      followingId: bookmark.followingId,
      followingImage: bookmark.followingImage,
    }),
    FollowerModel.create({
      userId: bookmark.followingId,
      followerName: bookmark.userName,
      followerId: bookmark.userId,
      followerImage: bookmark.userImage,
    }),
  ]);

  return result[0].id;
}

export async function findFollowings(bookmark: Bookmark, filter: Filter) {
  const result = await FollowingModel.find({ userId: bookmark.userId, ...filter.condition }, null, filter.toJson());
  return result?.map((bookmark) => Bookmark.parse(bookmark));
}

export async function findFollowers(bookmark: Bookmark, filter: Filter) {
  const result = await FollowerModel.find({ userId: bookmark.userId, ...filter.condition }, null, filter.toJson());
  return result?.map((bookmark) => Bookmark.parse(bookmark));
}

export async function removeBookmark(bookmark: Bookmark) {
  const result = await Promise.all([
    FollowingModel.findOneAndRemove(
      { followingName: bookmark.followingName, userId: bookmark.userId },
      { returnOriginal: false }
    ),
    FollowerModel.findOneAndRemove(
      { followerName: bookmark.userName, userId: bookmark.followingId },
      { returnOriginal: false }
    ),
  ]);

  return Bookmark.parse({ ...result[0], ...result[1] });
}
