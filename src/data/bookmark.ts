import Mongoose from 'mongoose';
import { MongoDB } from '../database/mongo';
import { Filter } from '../types/common';
import { Bookmark } from '../types/bookmark';

const followerSchema = new Mongoose.Schema({
  userId: { type: String, required: true },
  followerId: { type: String, required: true },
});

const followingSchema = new Mongoose.Schema({
  userId: { type: String, required: true },
  followingId: { type: String, required: true },
});

followerSchema.index({ userId: 1, followerId: 1 }, { unique: true });
followingSchema.index({ userId: 1, followingId: 1 }, { unique: true });

MongoDB.useVirtualId(followerSchema);
MongoDB.useVirtualId(followingSchema);
const FollowerModel = Mongoose.model('Follower', followerSchema);
const FollowingModel = Mongoose.model('Following', followingSchema);

export async function createBookmark(bookmark: Bookmark) {
  const result = await Promise.all([
    FollowerModel.create({ userId: bookmark.userId, followerId: bookmark.followerId }),
    FollowingModel.create({ userId: bookmark.followerId, followingId: bookmark.userId }),
  ]);

  return result[0].id;
}

export async function findFollowers(userId: string, filter: Filter) {
  const result = await FollowerModel.find({ userId }, null, filter.toJson());
  return result?.map((bookmark) => Bookmark.parse(bookmark));
}

export async function findFollowings(userId: string, filter: Filter) {
  const result = await FollowingModel.find({ userId }, null, filter.toJson());
  return result?.map((bookmark) => Bookmark.parse(bookmark));
}

export async function removeBookmark(bookmark: Bookmark) {
  const result = await Promise.all([
    FollowerModel.findOneAndRemove(
      { userId: bookmark.userId, followerId: bookmark.followerId },
      { returnOriginal: false }
    ),
    FollowingModel.findOneAndRemove(
      { userId: bookmark.followerId, followingId: bookmark.userId },
      { returnOriginal: false }
    ),
  ]);

  return Bookmark.parse(result[0]);
}
