import httpMocks from 'node-mocks-http';
import { faker } from '@faker-js/faker';
import { ErrorCode } from '../../types/error.util';
import { FailureObject } from '../../util/error.util';
import { BookmarkController } from '../bookmark';
import { createSortMap } from '../../util/common.util';
import { Filter } from '../../types/common';
import { Bookmark } from '../../types/bookmark';
import { fakeBookmark } from '../../util/tests/bookmark.util';
import { User } from '../../types/auth';
import { fakeUser } from '../../util/tests/auth.util';

describe('Bookmark Controller', () => {
  let bookmarkController: BookmarkController;
  let bookmarkRepository: any;
  let userRepository: any;

  beforeEach(() => {
    bookmarkRepository = {};
    userRepository = {};
    bookmarkController = new BookmarkController(bookmarkRepository, userRepository);
  });

  describe('createBookmark', () => {
    let follower: User;
    let following: User;
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      follower = User.parse(fakeUser());
      following = User.parse(fakeUser());
      request = httpMocks.createRequest({
        method: 'POST',
        url: `/bookmark`,
        body: { followingName: following.name },
      });
      response = httpMocks.createResponse();
    });

    it('Return 404 if there is no user', async () => {
      request.userId = follower.userId;
      userRepository.findById = jest.fn(() => User.parse(null));

      const createBookmark = async () => bookmarkController.createBookmark(request, response);

      await expect(createBookmark()).rejects.toStrictEqual(
        new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404)
      );
      expect(userRepository.findById).toHaveBeenCalledWith(request.userId);
    });

    it('Return 404 if there is no following user', async () => {
      request.userId = follower.userId;
      userRepository.findById = jest.fn(() => follower);
      userRepository.findByName = jest.fn(() => User.parse(null));

      const createBookmark = async () => bookmarkController.createBookmark(request, response);

      await expect(createBookmark()).rejects.toStrictEqual(
        new FailureObject(ErrorCode.NOT_FOUND, 'Following user not found', 404)
      );
      expect(userRepository.findById).toHaveBeenCalledWith(request.userId);
      expect(userRepository.findByName).toHaveBeenCalledWith(request.body.followingName);
    });

    it('Return 201, if bookmark is created successfully', async () => {
      request.userId = follower.userId;
      userRepository.findById = jest.fn(() => follower);
      userRepository.findByName = jest.fn(() => following);
      bookmarkRepository.createBookmark = jest.fn();

      await bookmarkController.createBookmark(request, response);

      expect(userRepository.findById).toHaveBeenCalledWith(request.userId);
      expect(userRepository.findByName).toHaveBeenCalledWith(request.body.followingName);
      expect(bookmarkRepository.createBookmark).toHaveBeenCalledWith(
        Bookmark.parse({
          userId: request.userId,
          userName: follower.name,
          userImage: follower.profile?.image,
          followingId: following.userId,
          followingName: following.name,
          followingImage: following.profile?.image,
        })
      );
      expect(response.statusCode).toBe(201);
    });
  });

  describe('getFollowings', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      request = httpMocks.createRequest({
        method: 'GET',
        url: `/bookmark/following`,
        query: {
          limit: 30,
          skip: 0,
        },
      });
      response = httpMocks.createResponse();
    });

    it('Return 200, if following list successfully found', async () => {
      request.userId = faker.random.alphaNumeric(24);
      // filter
      const limit = request.query.limit as string;
      const skip = request.query.skip as string;
      const keywords = request.query.keywords as string;
      const sort = createSortMap('-createdAt');
      const condition = { followingName: new RegExp(keywords, 'gi') };
      const filter = Filter.parse({ limit, skip, sort, condition });
      // get result
      const followings = [Bookmark.parse(fakeBookmark())];
      bookmarkRepository.findFollowings = jest.fn(() => followings);

      await bookmarkController.getFollowings(request, response);

      expect(bookmarkRepository.findFollowings).toHaveBeenCalledWith(request.userId, filter);
      expect(response._getJSONData()).toEqual({ followings: followings.map((bookmark) => bookmark.toJson()) });
      expect(response.statusCode).toBe(200);
    });
  });

  describe('getFollowers', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      request = httpMocks.createRequest({
        method: 'GET',
        url: `/bookmark/follower`,
        query: {
          limit: 30,
          skip: 0,
        },
      });
      response = httpMocks.createResponse();
    });

    it('Return 200, if follower list successfully found', async () => {
      request.userId = faker.random.alphaNumeric(24);
      // filter
      const limit = request.query.limit as string;
      const skip = request.query.skip as string;
      const keywords = request.query.keywords as string;
      const sort = createSortMap('-createdAt');
      const condition = { followerName: new RegExp(keywords, 'gi') };
      const filter = Filter.parse({ limit, skip, sort, condition });
      // get result
      const followers = [Bookmark.parse(fakeBookmark())];
      bookmarkRepository.findFollowers = jest.fn(() => followers);

      await bookmarkController.getFollowers(request, response);

      expect(bookmarkRepository.findFollowers).toHaveBeenCalledWith(request.userId, filter);
      expect(response._getJSONData()).toEqual({ followers: followers.map((bookmark) => bookmark.toJson()) });
      expect(response.statusCode).toBe(200);
    });
  });

  describe('removeBookmark', () => {
    let follower: User;
    let following: User;
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      follower = User.parse(fakeUser());
      following = User.parse(fakeUser());
      request = httpMocks.createRequest({
        method: 'DELETE',
        url: `/bookmark`,
        query: { followingName: following.name },
      });
      response = httpMocks.createResponse();
    });

    it('Return 404 if there is no user', async () => {
      request.userId = follower.userId;
      userRepository.findById = jest.fn(() => User.parse(null));

      const removeBookmark = async () => bookmarkController.removeBookmark(request, response);

      await expect(removeBookmark()).rejects.toStrictEqual(
        new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404)
      );
      expect(userRepository.findById).toHaveBeenCalledWith(request.userId);
    });

    it('Return 404 if there is no following user', async () => {
      const followingName = request.query.followingName;
      request.userId = follower.userId;
      userRepository.findById = jest.fn(() => follower);
      userRepository.findByName = jest.fn(() => User.parse(null));

      const removeBookmark = async () => bookmarkController.removeBookmark(request, response);

      await expect(removeBookmark()).rejects.toStrictEqual(
        new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404)
      );
      expect(userRepository.findById).toHaveBeenCalledWith(request.userId);
      expect(userRepository.findByName).toHaveBeenCalledWith(followingName);
    });

    it('Return 404 if there is no bookmark', async () => {
      const followingName = request.query.followingName;
      request.userId = follower.userId;
      userRepository.findById = jest.fn(() => follower);
      userRepository.findByName = jest.fn(() => following);
      bookmarkRepository.removeBookmark = jest.fn(() => Bookmark.parse(null));

      const removeBookmark = async () => bookmarkController.removeBookmark(request, response);

      await expect(removeBookmark()).rejects.toStrictEqual(
        new FailureObject(ErrorCode.NOT_FOUND, 'Bookmark not found', 404)
      );
      expect(userRepository.findById).toHaveBeenCalledWith(request.userId);
      expect(userRepository.findByName).toHaveBeenCalledWith(followingName);
      expect(bookmarkRepository.removeBookmark).toHaveBeenCalledWith(
        Bookmark.parse({
          userId: request.userId,
          userName: follower.name,
          followingId: following.userId,
          followingName,
        })
      );
    });

    it('Return 204, if bookmark successfully removed', async () => {
      const followingName = request.query.followingName;
      request.userId = follower.userId;
      userRepository.findById = jest.fn(() => follower);
      userRepository.findByName = jest.fn(() => following);
      bookmarkRepository.removeBookmark = jest.fn(() => Bookmark.parse({ id: faker.random.alphaNumeric(24) }));

      await bookmarkController.removeBookmark(request, response);

      expect(bookmarkRepository.removeBookmark).toHaveBeenCalledWith(
        Bookmark.parse({
          userId: request.userId,
          userName: follower.name,
          followingId: following.userId,
          followingName,
        })
      );
      expect(response.statusCode).toBe(204);
    });
  });
});
