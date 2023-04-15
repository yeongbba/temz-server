import axios, { AxiosInstance } from 'axios';
import { AddressInfo } from 'net';
import { Index } from '../..';
import { config } from '../../config';
import { TestOptions } from '../../types/common';
import { ErrorCode } from '../../types/error.util';
import { SocialLinks } from '../../types/link';
import { FailureObject } from '../../util/error.util';
import { csrfToken, loginUser } from '../../util/tests/auth.util';
import { authMiddleWareTest, csrfMiddleWareTest } from '../../util/tests/common.util';
import { fakeFailures } from '../../util/tests/error.util';
import { fakeSocialLinks, socialLinkFormatTest, socialLinkTypeTest } from '../../util/tests/link.util';

describe('Link APIs', () => {
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

  describe('POST to /link/social', () => {
    it('Return 201 if social link created successfully', async () => {
      const links = fakeSocialLinks(false);
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
      const res = await request.post(`/link/social`, links, {
        headers,
      });

      expect(res.status).toBe(201);
    });

    it('Return 409 if the social link is already registered', async () => {
      const links = fakeSocialLinks(false);
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
      const firstRes = await request.post(`/link/social`, links, {
        headers,
      });

      const secondRes = await request.post(`/link/social`, links, {
        headers,
      });

      expect(secondRes.status).toBe(409);
      expect(secondRes.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.DUPLICATED_VALUE, `Social Links already exist`, 409)])
      );
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const links = fakeSocialLinks(false);
        options = { method: 'post', url: '/link/social', data: links };
      });

      const formatTest = socialLinkFormatTest();
      test.each(formatTest.value)(`${formatTest.name}`, async (value) => {
        await formatTest.testFn(request, options, value);
      });

      const typeTest = socialLinkTypeTest();
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'social');
      });
    });
  });

  describe('PUT to /link/social', () => {
    it('Return 204 if social link updated successfully', async () => {
      const links = fakeSocialLinks(false);
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/link/social`, links, {
        headers,
      });

      const res = await request.put(`/link/social`, links, {
        headers,
      });

      expect(res.status).toBe(204);
    });

    it('Return 404 if the social link is not registered', async () => {
      const links = fakeSocialLinks(false);
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
      const res = await request.put(`/link/social`, links, {
        headers,
      });

      expect(res.status).toBe(404);
      expect(res.data).toEqual(fakeFailures([new FailureObject(ErrorCode.NOT_FOUND, 'Social Links not found', 404)]));
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const links = fakeSocialLinks(false);
        options = { method: 'put', url: '/link/social', data: links };
      });

      const formatTest = socialLinkFormatTest();
      test.each(formatTest.value)(`${formatTest.name}`, async (value) => {
        await formatTest.testFn(request, options, value);
      });

      const typeTest = socialLinkTypeTest();
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'social');
      });
    });
  });

  describe.only('GET to /link/social', () => {
    it('Return 200 and social links if the link is found successfully', async () => {
      const links = fakeSocialLinks(false);
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/link/social`, links, {
        headers,
      });

      const res = await request.get(`/link/social`, {
        headers,
      });

      expect(res.status).toBe(200);
      expect(res.data).toEqual(SocialLinks.parse(links).toJson());
    });

    it('Return 200 and empty links if the social link is not found', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };

      const res = await request.get(`/link/social`, {
        headers,
      });

      expect(res.status).toBe(200);
      expect(res.data).toEqual(SocialLinks.parse(null).toJson());
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeAll(() => {
        options = { method: 'get', url: '/link/social' };
      });

      test.each(authMiddleWareTest)('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'social');
      });
    });
  });
});
