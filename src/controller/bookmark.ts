import { Request, Response } from 'express';
import { FailureObject } from '../util/error.util';
import { ErrorCode } from '../types/error.util';
import { Filter } from '../types/common';
import { createSortMap } from '../util/common.util';
import { Bookmark } from '../types/bookmark';
import { User } from '../types/auth';

export class BookmarkController {
  constructor(private bookmarkRepository: any, private userRepository: any) {}

  createBookmark = async (req: Request, res: Response) => {
    const { followingName } = req.body;

    const user: User = await this.userRepository.findById((req as any).userId);
    if (!user.userId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
      throw failure;
    }

    const following: User = await this.userRepository.findByName(followingName);
    if (!following.userId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'Following user not found', 404);
      throw failure;
    }

    const bookmark = Bookmark.parse({
      userId: (req as any).userId,
      userName: user.name,
      userImage: user.profile?.image,
      followingId: following.userId,
      followingName: following.name,
      followingImage: following.profile?.image,
    });

    await this.bookmarkRepository.createBookmark(bookmark);
    res.sendStatus(201);
  };

  getFollowings = async (req: Request, res: Response) => {
    const limit = req.query.limit as string;
    const skip = req.query.skip as string;
    const keywords = req.query.keywords as string;
    const sort = createSortMap('-createdAt');
    const condition = { followingName: new RegExp(keywords, 'gi') };

    const filter = Filter.parse({ limit, skip, sort, condition });
    const followings: Bookmark[] = await this.bookmarkRepository.findFollowings((req as any).userId, filter);
    res.status(200).json({ followings: followings.map((bookmark) => bookmark.toJson()) });
  };

  getFollowers = async (req: Request, res: Response) => {
    const limit = req.query.limit as string;
    const skip = req.query.skip as string;
    const keywords = req.query.keywords as string;
    const sort = createSortMap('-createdAt');
    const condition = { followerName: new RegExp(keywords, 'gi') };

    const filter = Filter.parse({ limit, skip, sort, condition });
    const followers: Bookmark[] = await this.bookmarkRepository.findFollowers((req as any).userId, filter);
    res.status(200).json({ followers: followers.map((bookmark) => bookmark.toJson()) });
  };

  removeBookmark = async (req: Request, res: Response) => {
    const followingName = req.query.followingName as string;
    const user: User = await this.userRepository.findById((req as any).userId);
    if (!user.userId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
      throw failure;
    }

    const bookmark = Bookmark.parse({ userId: (req as any).userId, userName: user.name, followingName });

    const following: User = await this.userRepository.findByName(bookmark.followingName);
    if (!following.userId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
      throw failure;
    }
    bookmark.followingId = following.userId;

    const result: Bookmark = await this.bookmarkRepository.removeBookmark(bookmark);
    if (!result.bookmarkId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'Bookmark not found', 404);
      throw failure;
    }

    res.sendStatus(204);
  };
}
