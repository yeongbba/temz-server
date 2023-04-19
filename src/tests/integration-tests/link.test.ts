import axios, { AxiosInstance } from 'axios';
import { AddressInfo } from 'net';
import { Index } from '../..';
import { config } from '../../config';
import { THEME_MAX_COUNT } from '../../controller/link';
import { TestOptions } from '../../types/common';
import { ErrorCode } from '../../types/error.util';
import { GeneralLinks, SocialLinks } from '../../types/link';
import { FailureObject } from '../../util/error.util';
import { csrfToken, loginUser } from '../../util/tests/auth.util';
import { authMiddleWareTest, csrfMiddleWareTest } from '../../util/tests/common.util';
import { fakeFailures } from '../../util/tests/error.util';
import {
  fakeGeneralLinks,
  fakeSocialLinks,
  generalLinkFormatTest,
  generalLinkItemCountTest,
  generalLinkMaxLengthTest,
  generalLinkMinLengthTest,
  generalLinkMissingTest,
  generalLinkTypeTest,
  socialLinkFormatTest,
  socialLinkMaxLengthTest,
  socialLinkMinLengthTest,
  socialLinkMissingTest,
  socialLinkTypeTest,
} from '../../util/tests/link.util';

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
      const links = SocialLinks.parse(fakeSocialLinks(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
      const res = await request.post(`/link/social`, links, {
        headers,
      });

      expect(res.status).toBe(201);
    });

    it('Return 409 if the social link is already registered', async () => {
      const links = SocialLinks.parse(fakeSocialLinks(false)).toJson();
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
        const links = SocialLinks.parse(fakeSocialLinks(false)).toJson();
        options = { method: 'post', url: '/link/social', data: links };
      });

      const maxLengthTest = socialLinkMaxLengthTest();
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const missingTest = socialLinkMissingTest();
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
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
      const links = SocialLinks.parse(fakeSocialLinks(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/link/social`, links, {
        headers,
      });

      const getLinks = await request.get(`/link/social`, {
        headers,
      });

      const updateLinks = SocialLinks.parse(fakeSocialLinks(false)).toJson();
      updateLinks.linkId = getLinks.data.linkId;

      const res = await request.put(`/link/social`, updateLinks, {
        headers,
      });

      expect(res.status).toBe(204);
    });

    it('Return 404 if the social link is not registered', async () => {
      const links = SocialLinks.parse(fakeSocialLinks()).toJson();
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
        const links = SocialLinks.parse(fakeSocialLinks()).toJson();
        options = { method: 'put', url: '/link/social', data: links };
      });

      const minLengthTest = socialLinkMinLengthTest();
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = socialLinkMaxLengthTest();
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const missingTest = socialLinkMissingTest();
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
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

  describe('GET to /link/social', () => {
    it('Return 200 and social links if the link is found successfully', async () => {
      const links = SocialLinks.parse(fakeSocialLinks(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/link/social`, links, {
        headers,
      });

      const res = await request.get(`/link/social`, {
        headers,
      });

      links.linkId = res.data.linkId;

      expect(res.status).toBe(200);
      expect(res.data).toEqual(links);
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

  describe('POST to /link/general', () => {
    it('Return 201 if general link created successfully', async () => {
      const links = GeneralLinks.parse(fakeGeneralLinks(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
      const res = await request.post(`/link/general`, links, {
        headers,
      });

      expect(res.status).toBe(201);
    });

    it('Return 406 if the number of links that can be created is exceeded', async () => {
      const links = GeneralLinks.parse(fakeGeneralLinks(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };

      for (let i = 0; i < THEME_MAX_COUNT; i++) {
        await request.post(`/link/general`, links, {
          headers,
        });
      }

      const res = await request.post(`/link/general`, links, {
        headers,
      });

      expect(res.status).toBe(406);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.NOT_ACCEPTABLE, `${THEME_MAX_COUNT} themes have already been created.`, 406),
        ])
      );
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const links = GeneralLinks.parse(fakeGeneralLinks(false)).toJson();
        options = { method: 'post', url: '/link/general', data: links };
      });

      const maxLengthTest = generalLinkMaxLengthTest();
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const missingTest = generalLinkMissingTest();
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const itemCountTest = generalLinkItemCountTest();
      test.each(itemCountTest.value)(`${itemCountTest.name}`, async (value) => {
        await itemCountTest.testFn(request, options, value);
      });

      const formatTest = generalLinkFormatTest();
      test.each(formatTest.value)(`${formatTest.name}`, async (value) => {
        await formatTest.testFn(request, options, value);
      });

      const typeTest = generalLinkTypeTest();
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'general');
      });
    });
  });

  describe('PUT to /link/general', () => {
    it('Return 204 if general link updated successfully', async () => {
      const links = GeneralLinks.parse(fakeGeneralLinks(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/link/general`, links, {
        headers,
      });

      const getThemes = await request.get(`/link/general`, {
        headers,
      });

      const updateLinks = GeneralLinks.parse(fakeGeneralLinks(false)).toJson();
      updateLinks.linkId = getThemes.data.themes[0].linkId;

      const res = await request.put(`/link/general`, updateLinks, {
        headers,
      });

      expect(res.status).toBe(204);
    });

    it('Return 404 if the general link is not registered', async () => {
      const links = GeneralLinks.parse(fakeGeneralLinks()).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
      const res = await request.put(`/link/general`, links, {
        headers,
      });

      expect(res.status).toBe(404);
      expect(res.data).toEqual(fakeFailures([new FailureObject(ErrorCode.NOT_FOUND, 'General Links not found', 404)]));
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const links = GeneralLinks.parse(fakeGeneralLinks()).toJson();
        options = { method: 'put', url: '/link/general', data: links };
      });

      const minLengthTest = generalLinkMinLengthTest();
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = generalLinkMaxLengthTest();
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const missingTest = generalLinkMissingTest();
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const itemCountTest = generalLinkItemCountTest();
      test.each(itemCountTest.value)(`${itemCountTest.name}`, async (value) => {
        await itemCountTest.testFn(request, options, value);
      });

      const formatTest = generalLinkFormatTest();
      test.each(formatTest.value)(`${formatTest.name}`, async (value) => {
        await formatTest.testFn(request, options, value);
      });

      const typeTest = generalLinkTypeTest();
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'general');
      });
    });
  });

  describe('GET to /link/general', () => {
    it('Return 200 and general links if the link is found successfully', async () => {
      const links = GeneralLinks.parse(fakeGeneralLinks(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/link/general`, links, {
        headers,
      });

      const res = await request.get(`/link/general`, {
        headers,
      });
      const theme = GeneralLinks.parse(links).toJson();
      theme.linkId = res.data.themes[0].linkId;

      expect(res.status).toBe(200);
      expect(res.data.themes).toContainEqual(theme);
    });

    it('Return 200 and empty array if the general link is not found', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };

      const res = await request.get(`/link/general`, {
        headers,
      });

      expect(res.status).toBe(200);
      expect(res.data.themes).toHaveLength(0);
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeAll(() => {
        options = { method: 'get', url: '/link/general' };
      });

      test.each(authMiddleWareTest)('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'general');
      });
    });
  });

  describe('DELETE to /link/general', () => {
    it('Return 204 if general link removed successfully', async () => {
      const links = GeneralLinks.parse(fakeGeneralLinks(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/link/general`, links, {
        headers,
      });

      const getThemes = await request.get(`/link/general`, {
        headers,
      });
      const linkId = getThemes.data.themes[0].linkId;

      const res = await request.delete(`/link/general`, {
        params: {
          linkId,
        },
        headers,
      });

      expect(res.status).toBe(204);
    });

    it('Return 404 if the general link is not registered', async () => {
      const links = GeneralLinks.parse(fakeGeneralLinks()).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
      const res = await request.delete(`/link/general`, {
        params: {
          linkId: links.linkId,
        },
        headers,
      });

      expect(res.status).toBe(404);
      expect(res.data).toEqual(fakeFailures([new FailureObject(ErrorCode.NOT_FOUND, 'General Links not found', 404)]));
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const links = GeneralLinks.parse(fakeGeneralLinks()).toJson();
        options = {
          method: 'delete',
          url: '/link/general',
          params: {
            linkId: links.linkId,
          },
        };
      });

      const minLengthTest = generalLinkMinLengthTest();
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = generalLinkMaxLengthTest([{ failedFieldName: 'linkId' }]);
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const missingTest = generalLinkMissingTest([{ failedFieldName: 'linkId' }]);
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'general');
      });
    });
  });
});
