import axios, { AxiosInstance } from 'axios';
import { AddressInfo } from 'net';
import { Index } from '../..';
import { config } from '../../config';
import { TestOptions } from '../../types/common';
import { ErrorCode } from '../../types/error.util';
import { FailureObject } from '../../util/error.util';
import { csrfToken, fakeUser, loginUser } from '../../util/tests/auth.util';
import { authMiddleWareTest, csrfMiddleWareTest } from '../../util/tests/common.util';
import { fakeFailures } from '../../util/tests/error.util';
import { Bookmark } from '../../types/bookmark';
import {
  bookmarkMaxLengthTest,
  bookmarkMinLengthTest,
  bookmarkMissingTest,
  bookmarkTypeTest,
  fakeBookmark,
} from '../../util/tests/bookmark.util';
import { createNewUser } from '../../util/tests/auth.util';

describe('Bookmark APIs', () => {
  let index: Index;
  let request: AxiosInstance;

  beforeAll(async () => {
    index = await Index.AsyncStart();
    request = axios.create({
      baseURL: `http://localhost:${(index.server.address() as AddressInfo).port}`,
      validateStatus: null,
    });
  });

  afterAll(async () => {
    await index.stop();
  });

  describe('POST to /bookmark', () => {
    it('Return 201 if bookmark created successfully', async () => {
      const following = await createNewUser(request);
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };
      const res = await request.post(
        `/bookmark`,
        { followingName: following.name },
        {
          headers,
        }
      );

      expect(res.status).toBe(201);
    });

    it('Return 404 if the following is not registered', async () => {
      const following = fakeUser(false);
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };

      const res = await request.post(
        `/bookmark`,
        { followingName: following.name },
        {
          headers,
        }
      );

      expect(res.status).toBe(404);
      expect(res.data).toEqual(fakeFailures([new FailureObject(ErrorCode.NOT_FOUND, 'Following user not found', 404)]));
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const followingName = fakeBookmark(false).followingName;
        options = { method: 'post', url: '/bookmark', data: { followingName } };
      });

      const missingTest = bookmarkMissingTest();
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const typeTest = bookmarkTypeTest();
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });

      const minLengthTest = bookmarkMinLengthTest();
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = bookmarkMaxLengthTest();
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'bookmark');
      });
    });
  });

  describe('GET to /bookmark/following', () => {
    it('Return 200 and following list if the following list is found successfully without queryParams', async () => {
      const following = await loginUser(request);
      const follower = await loginUser(request);
      const csrf = await csrfToken(request, follower.token.access);

      const headers = { Authorization: `Bearer ${follower.token.access}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(
        `/bookmark`,
        { followingName: following.user.name },
        {
          headers,
        }
      );

      const res = await request.get(`/bookmark/following`, {
        headers,
      });

      const savedBookmark = Bookmark.parse({
        userId: follower.user.userId,
        followingId: following.user.userId,
        followingName: following.user.name,
        followingImage: following.user.profile?.image,
      }).toJson();
      savedBookmark.bookmarkId = res.data.followings[0].bookmarkId;

      expect(res.status).toBe(200);
      expect(res.data.followings).toContainEqual(savedBookmark);
    });

    it('Return 200 and following list if the following list is found successfully with queryParams', async () => {
      const followings = await Promise.all(Array.from(Array(3), async () => loginUser(request)));
      const follower = await loginUser(request);
      const csrf = await csrfToken(request, follower.token.access);

      const headers = { Authorization: `Bearer ${follower.token.access}`, [config.csrf.tokenKey]: csrf.token };

      for (const following of followings) {
        await request.post(
          `/bookmark`,
          { followingName: following.user.name },
          {
            headers,
          }
        );
      }

      const res = await request.get(`/bookmark/following`, {
        headers,
        params: {
          limit: 3,
          skip: 0,
          keywords: followings[0].user.name,
        },
      });

      const searchedBookmark = Bookmark.parse({
        userId: follower.user.userId,
        followingId: followings[0].user.userId,
        followingName: followings[0].user.name,
        followingImage: followings[0].user.profile?.image,
      }).toJson();
      searchedBookmark.bookmarkId = res.data.followings[0].bookmarkId;

      expect(res.status).toBe(200);
      expect(res.data.followings).toContainEqual(searchedBookmark);
    });

    it('Return 200 and empty array if followings are not found', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };

      const res = await request.get(`/bookmark/following`, {
        headers,
      });

      expect(res.status).toBe(200);
      expect(res.data.followings).toHaveLength(0);
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeAll(() => {
        options = { method: 'get', url: '/bookmark/following' };
      });

      test.each(authMiddleWareTest)('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'following');
      });
    });
  });

  describe('GET to /bookmark/follower', () => {
    it('Return 200 and follower list if the follower list is found successfully without queryParams', async () => {
      const following = await loginUser(request);
      const follower = await loginUser(request);
      const csrf = await csrfToken(request, follower.token.access);

      const followerHeaders = { Authorization: `Bearer ${follower.token.access}`, [config.csrf.tokenKey]: csrf.token };
      const followingHeaders = {
        Authorization: `Bearer ${following.token.access}`,
        [config.csrf.tokenKey]: csrf.token,
      };

      await request.post(
        `/bookmark`,
        { followingName: following.user.name },
        {
          headers: followerHeaders,
        }
      );

      const res = await request.get(`/bookmark/follower`, {
        headers: followingHeaders,
      });

      const savedBookmark = Bookmark.parse({
        userId: following.user.userId,
        followerId: follower.user.userId,
        followerName: follower.user.name,
        followerImage: follower.user.profile?.image,
      }).toJson();
      savedBookmark.bookmarkId = res.data.followers[0].bookmarkId;

      expect(res.status).toBe(200);
      expect(res.data.followers).toContainEqual(savedBookmark);
    });

    it('Return 200 and follower list if the follower list is found successfully with queryParams', async () => {
      const followers = await Promise.all(Array.from(Array(3), async () => loginUser(request)));
      const following = await loginUser(request);
      const followingCsrf = await csrfToken(request, following.token.access);
      const followingHeaders = {
        Authorization: `Bearer ${following.token.access}`,
        [config.csrf.tokenKey]: followingCsrf.token,
      };

      for (const follower of followers) {
        const csrf = await csrfToken(request, follower.token.access);
        const headers = { Authorization: `Bearer ${follower.token.access}`, [config.csrf.tokenKey]: csrf.token };

        await request.post(
          `/bookmark`,
          { followingName: following.user.name },
          {
            headers,
          }
        );
      }

      const res = await request.get(`/bookmark/follower`, {
        headers: followingHeaders,
        params: {
          limit: 3,
          skip: 0,
          keywords: followers[0].user.name,
        },
      });

      const searchedBookmark = Bookmark.parse({
        userId: following.user.userId,
        followerId: followers[0].user.userId,
        followerName: followers[0].user.name,
        followerImage: followers[0].user.profile?.image,
      }).toJson();
      searchedBookmark.bookmarkId = res.data.followers[0].bookmarkId;

      expect(res.status).toBe(200);
      expect(res.data.followers).toContainEqual(searchedBookmark);
    });

    it('Return 200 and empty array if followers are not found', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };

      const res = await request.get(`/bookmark/follower`, {
        headers,
      });

      expect(res.status).toBe(200);
      expect(res.data.followers).toHaveLength(0);
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeAll(() => {
        options = { method: 'get', url: '/bookmark/follower' };
      });

      test.each(authMiddleWareTest)('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'follower');
      });
    });
  });

  describe('DELETE to /bookmark', () => {
    it('Return 204 if the bookmark removed successfully', async () => {
      const following = await loginUser(request);
      const follower = await loginUser(request);
      const csrf = await csrfToken(request, follower.token.access);

      const headers = { Authorization: `Bearer ${follower.token.access}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(
        `/bookmark`,
        { followingName: following.user.name },
        {
          headers,
        }
      );

      const res = await request.delete(`/bookmark`, {
        params: {
          followingName: following.user.name,
        },
        headers,
      });

      expect(res.status).toBe(204);
    });

    it('Return 404 if the following is not registered', async () => {
      const following = fakeUser(false);
      const follower = await loginUser(request);
      const csrf = await csrfToken(request, follower.token.access);

      const headers = { Authorization: `Bearer ${follower.token.access}`, [config.csrf.tokenKey]: csrf.token };

      const res = await request.delete(`/bookmark`, {
        params: {
          followingName: following.name,
        },
        headers,
      });

      expect(res.status).toBe(404);
      expect(res.data).toEqual(fakeFailures([new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404)]));
    });

    it('Return 404 if the bookmark is not registered', async () => {
      const following = await loginUser(request);
      const follower = await loginUser(request);
      const csrf = await csrfToken(request, follower.token.access);

      const headers = { Authorization: `Bearer ${follower.token.access}`, [config.csrf.tokenKey]: csrf.token };

      const res = await request.delete(`/bookmark`, {
        params: {
          followingName: following.user.name,
        },
        headers,
      });

      expect(res.status).toBe(404);
      expect(res.data).toEqual(fakeFailures([new FailureObject(ErrorCode.NOT_FOUND, 'Bookmark not found', 404)]));
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const followingName = fakeBookmark(false).followingName;
        options = {
          method: 'delete',
          url: '/bookmark',
          params: {
            followingName,
          },
        };
      });

      const missingTest = bookmarkMissingTest();
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const minLengthTest = bookmarkMinLengthTest();
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = bookmarkMaxLengthTest();
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'bookmark');
      });
    });
  });
});
