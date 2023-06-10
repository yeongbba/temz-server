import jwt from 'jsonwebtoken';
import axios, { AxiosInstance } from 'axios';
import {
  authFormatTest,
  authMaxLengthTest,
  authMinLengthTest,
  authMissingTest,
  authPatternTest,
  authTypeTest,
  createNewUser,
  csrfToken,
  DATE_REGEX,
  fakeUser,
  loginUser,
} from '../../util/tests/auth.util';
import { AddressInfo } from 'net';
import { Index } from '../..';
import { FailureObject } from '../../util/error.util';
import { ErrorCode } from '../../types/error.util';
import { faker } from '@faker-js/faker';
import { fakeFailures } from '../../util/tests/error.util';
import { config } from '../../config';
import { TestOptions } from '../../types/common';
import { authMiddleWareTest, csrfMiddleWareTest } from '../../util/tests/common.util';

describe('Auth APIs', () => {
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

  describe('GET to /auth/check-name', () => {
    it('returns isValid to true if user does not exist', async () => {
      const user = fakeUser(false);

      const res = await request.get(`/auth/check-name`, {
        params: {
          name: user.name,
        },
      });

      expect(res.status).toBe(200);
      expect(res.data).toEqual({ isValid: true });
    });

    it('returns isValid to false if user exists', async () => {
      const user = await createNewUser(request);

      const res = await request.get(`/auth/check-name`, {
        params: {
          name: user.name,
        },
      });

      expect(res.status).toBe(200);
      expect(res.data).toEqual({ isValid: false });
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const user = fakeUser(false);
        options = {
          method: 'get',
          url: '/auth/check-name',
          params: {
            name: user.name,
          },
        };
      });

      const missingTest = authMissingTest([{ failedFieldName: 'name' }]);
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const minLengthTest = authMinLengthTest([{ failedFieldName: 'name' }]);
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = authMaxLengthTest([{ failedFieldName: 'name' }]);
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });
    });
  });

  describe('GET to /auth/me', () => {
    let options: TestOptions;

    beforeAll(() => {
      options = { method: 'get', url: '/auth/me' };
    });

    it('returns 200 and user if user exist', async () => {
      const { token, user } = await loginUser(request);

      const res = await request.get(`/auth/me`, {
        headers: { Authorization: `Bearer ${token.access}` },
      });

      expect(res.status).toBe(200);
      expect(res.data.user).toMatchObject({
        name: user.name,
        phone: user.phone,
        profile: user.profile,
        email: user.email,
        wallet: user.wallet,
        isDormant: false,
        createdAt: expect.stringMatching(DATE_REGEX),
        updatedAt: expect.stringMatching(DATE_REGEX),
      });
    });

    test.each(authMiddleWareTest)('$name', async ({ name, testFn }) => {
      await testFn(request, options, null, 'me');
    });
  });

  describe('GET to /auth/csrf', () => {
    let options: TestOptions;

    beforeAll(() => {
      options = { method: 'get', url: '/auth/csrf' };
    });

    it('returns 200 and csrf token', async () => {
      const { token } = await loginUser(request);

      const res = await request.get(`/auth/csrf`, {
        headers: { Authorization: `Bearer ${token.access}` },
      });

      expect(res.status).toBe(200);
      expect(res.data.token.length).toBeGreaterThan(0);
    });

    test.each(authMiddleWareTest)('$name', async ({ name, testFn }) => {
      await testFn(request, options, null, 'csrf');
    });
  });

  describe('POST to /auth/signup', () => {
    it('returns 201 when user info is valid', async () => {
      const user = fakeUser(false);

      const res = await request.post('/auth/signup', user);

      expect(res.status).toBe(201);
    });

    it('returns 409 when username has already been taken', async () => {
      const user = fakeUser(false);

      const firstSignup = await request.post('/auth/signup', user);
      expect(firstSignup.status).toBe(201);

      const secondSignup = await request.post('/auth/signup', user);
      expect(secondSignup.status).toBe(409);
      expect(secondSignup.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.DUPLICATED_VALUE, `${user.name} already exists`, 409)])
      );
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const user = fakeUser(false);
        options = {
          method: 'post',
          url: '/auth/signup',
          data: user,
        };
      });

      const missingTest = authMissingTest();
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const minLengthTest = authMinLengthTest();
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        const user = fakeUser(false);
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = authMaxLengthTest();
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const formatTest = authFormatTest();
      test.each(formatTest.value)(`${formatTest.name}`, async (value) => {
        await formatTest.testFn(request, options, value);
      });

      const patternTest = authPatternTest();
      test.each(patternTest.value)(`${patternTest.name}`, async (value) => {
        await patternTest.testFn(request, options, value);
      });

      const typeTest = authTypeTest();
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });
    });
  });

  describe('POST to /auth/login', () => {
    it('returns 200 and authorization token when user credentials are valid', async () => {
      const user = await createNewUser(request);

      const res = await request.post('/auth/login', {
        name: user.name,
        password: user.password,
      });

      expect(res.status).toBe(201);
      expect(res.data.token.access.length).toBeGreaterThan(0);
      expect(res.data.token.refresh.length).toBeGreaterThan(0);
      expect(res.data.user).toMatchObject({
        name: user.name,
        phone: user.phone,
        profile: user.profile,
        email: user.email,
        wallet: user.wallet,
        isDormant: false,
        createdAt: expect.stringMatching(DATE_REGEX),
        updatedAt: expect.stringMatching(DATE_REGEX),
      });
    });

    it('returns 401 when username is not found', async () => {
      const randomName = faker.string.alpha(10);
      const user = await createNewUser(request);

      const res = await request.post('/auth/login', {
        name: randomName,
        password: user.password,
      });

      expect(res.status).toBe(401);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.INVALID_VALUE, 'Invalid user or password', 401)])
      );
    });

    it('returns 401 when password is incorrect', async () => {
      const wrongPassword = '12!' + faker.internet.password();
      const user = await createNewUser(request);

      const res = await request.post('/auth/login', {
        name: user.name,
        password: wrongPassword,
      });

      expect(res.status).toBe(401);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.INVALID_VALUE, 'Invalid user or password', 401)])
      );
    });

    it('returns 404 when phone number was not found', async () => {
      const user = await createNewUser(request);
      const samePhoneNumberUser = fakeUser(false);
      samePhoneNumberUser.phone = user.phone;
      await request.post('/auth/signup', samePhoneNumberUser);
      const res = await request.post('/auth/login', {
        name: user.name,
        password: user.password,
      });

      expect(res.status).toBe(404);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.NOT_FOUND, 'Phone number was not found', 404)])
      );
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const user = fakeUser(false);
        options = {
          method: 'post',
          url: '/auth/login',
          data: {
            name: user.name,
            password: user.password,
          },
        };
      });

      const missingTest = authMissingTest([{ failedFieldName: 'name' }, { failedFieldName: 'password' }]);
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const minLengthTest = authMinLengthTest([{ failedFieldName: 'name' }]);
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = authMaxLengthTest([{ failedFieldName: 'name' }]);
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const patternTest = authPatternTest([{ failedFieldName: 'password' }]);
      test.each(patternTest.value)(`${patternTest.name}`, async (value) => {
        await patternTest.testFn(request, options, value);
      });

      const typeTest = authTypeTest([{ failedFieldName: 'name' }, { failedFieldName: 'password' }]);
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });
    });
  });

  describe('POST to /auth/find-name', () => {
    it('returns 200 and user name if user exists', async () => {
      const user = await createNewUser(request);

      const res = await request.post(`/auth/find-name`, { phone: user.phone });

      expect(res.status).toBe(200);
      expect(res.data).toEqual({
        name: user.name,
      });
    });

    it('returns 404 if user does not exist', async () => {
      const phone = faker.phone.number('010########');
      const res = await request.post(`/auth/find-name`, { phone });

      expect(res.status).toBe(404);
      expect(res.data).toEqual(fakeFailures([new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404)]));
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const user = fakeUser(false);
        options = {
          method: 'post',
          url: '/auth/find-name',
          data: {
            phone: user.phone,
          },
        };
      });

      const missingTest = authMissingTest([{ failedFieldName: 'phone' }]);
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const patternTest = authPatternTest([{ failedFieldName: 'phone' }]);
      test.each(patternTest.value)(`${patternTest.name}`, async (value) => {
        await patternTest.testFn(request, options, value);
      });

      const typeTest = authTypeTest([{ failedFieldName: 'phone' }]);
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });
    });
  });

  describe('POST to /auth/reset-password', () => {
    it('returns 201 if password reset successfully', async () => {
      const user = await createNewUser(request);

      const res = await request.post(`/auth/reset-password`, {
        name: user.name,
        password: '12!' + faker.internet.password(),
      });

      expect(res.status).toBe(201);
    });

    it('returns 404 and user name if user does not exist', async () => {
      const name = faker.string.alpha(15);

      const res = await request.post(`/auth/reset-password`, {
        name,
        password: '12!' + faker.internet.password(),
      });

      expect(res.status).toBe(404);
      expect(res.data).toEqual(fakeFailures([new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404)]));
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const user = fakeUser(false);
        options = {
          method: 'post',
          url: '/auth/reset-password',
          data: {
            name: user.name,
            password: user.password,
          },
        };
      });

      const missingTest = authMissingTest([{ failedFieldName: 'name' }, { failedFieldName: 'password' }]);
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const minLengthTest = authMinLengthTest([{ failedFieldName: 'name' }]);
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = authMaxLengthTest([{ failedFieldName: 'name' }]);
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const patternTest = authPatternTest([{ failedFieldName: 'password' }]);
      test.each(patternTest.value)(`${patternTest.name}`, async (value) => {
        await patternTest.testFn(request, options, value);
      });

      const typeTest = authTypeTest([{ failedFieldName: 'name' }, { failedFieldName: 'password' }]);
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });
    });
  });

  describe('POST to /auth/check-password', () => {
    it('returns 200 and isValid true if the password match', async () => {
      const user = await createNewUser(request);
      const login = await request.post('/auth/login', {
        name: user.name,
        password: user.password,
      });
      const csrf = await csrfToken(request, login.data.token.access);

      const res = await request.post(
        `/auth/check-password`,
        {
          password: user.password,
        },
        {
          headers: { Authorization: `Bearer ${login.data.token.access}`, [config.csrf.tokenKey]: csrf.token },
        }
      );

      expect(res.status).toBe(200);
      expect(res.data).toEqual({ isValid: true });
    });

    it('returns 200 and isValid false if the password does not match', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const res = await request.post(
        `/auth/check-password`,
        {
          password: '13!' + faker.internet.password(),
        },
        {
          headers: { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token },
        }
      );

      expect(res.status).toBe(200);
      expect(res.status).toBe(200);
      expect(res.data).toEqual({ isValid: false });
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const user = fakeUser(false);
        options = {
          method: 'post',
          url: '/auth/check-password',
          data: {
            password: user.password,
          },
        };
      });

      const missingTest = authMissingTest([{ failedFieldName: 'password' }]);
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const patternTest = authPatternTest([{ failedFieldName: 'password' }]);
      test.each(patternTest.value)(`${patternTest.name}`, async (value) => {
        await patternTest.testFn(request, options, value);
      });

      const typeTest = authTypeTest([{ failedFieldName: 'password' }]);
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });
    });
  });

  describe('POST to /auth/check-phone', () => {
    it('returns 200 if the user exist and the names match', async () => {
      const user = await createNewUser(request);

      const res = await request.post(`/auth/check-phone`, {
        name: user.name,
        phone: user.phone,
      });

      expect(res.status).toBe(200);
    });

    it('returns 404 if user does not exist', async () => {
      const user = await createNewUser(request);

      const res = await request.post(`/auth/check-phone`, {
        name: user.name,
        phone: faker.phone.number('010########'),
      });

      expect(res.status).toBe(404);
      expect(res.data).toEqual(fakeFailures([new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404)]));
    });

    it('returns 400 if the name does not match', async () => {
      const user = await createNewUser(request);

      const res = await request.post(`/auth/check-phone`, {
        name: faker.string.alpha(15),
        phone: user.phone,
      });

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.INVALID_VALUE, 'Name does not match the owner of the phone', 400)])
      );
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const user = fakeUser(false);
        options = {
          method: 'post',
          url: '/auth/check-phone',
          data: {
            name: user.name,
            phone: user.phone,
          },
        };
      });

      const missingTest = authMissingTest([{ failedFieldName: 'name' }, { failedFieldName: 'phone' }]);
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const minLengthTest = authMinLengthTest([{ failedFieldName: 'name' }]);
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = authMaxLengthTest([{ failedFieldName: 'name' }]);
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const patternTest = authPatternTest([{ failedFieldName: 'phone' }]);
      test.each(patternTest.value)(`${patternTest.name}`, async (value) => {
        await patternTest.testFn(request, options, value);
      });

      const typeTest = authTypeTest([{ failedFieldName: 'name' }, { failedFieldName: 'phone' }]);
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });
    });
  });

  describe('POST to /auth/logout', () => {
    let options: TestOptions;

    beforeAll(() => {
      options = { method: 'post', url: '/auth/logout', data: {} };
    });

    it('returns 201 if logout is successful', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const res = await request.post(
        `/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token },
        }
      );
      expect(res.status).toBe(201);
    });

    test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
      await testFn(request, options, null, 'logout');
    });
  });

  describe('PUT to /auth/update', () => {
    it('returns 204 if update is successful', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);
      const updateUser = fakeUser(false);

      const res = await request.put(
        `/auth/update`,
        {
          name: updateUser.name,
          profile: updateUser.profile,
          email: updateUser.email,
          phone: updateUser.phone,
          wallet: updateUser.wallet,
        },
        {
          headers: { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token },
        }
      );
      expect(res.status).toBe(204);
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const user = fakeUser(false);
        options = {
          method: 'put',
          url: '/auth/update',
          data: {
            name: user.name,
            profile: user.profile,
            email: user.email,
            phone: user.phone,
            wallet: user.wallet,
          },
        };
      });

      const missingTest = authMissingTest([
        { failedFieldName: 'name' },
        { failedFieldName: 'phone' },
        { failedFieldName: 'profile' },
        { parentFieldName: 'profile', failedFieldName: 'title' },
      ]);
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const minLengthTest = authMinLengthTest();
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = authMaxLengthTest();
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const formatTest = authFormatTest();
      test.each(formatTest.value)(`${formatTest.name}`, async (value) => {
        await formatTest.testFn(request, options, value);
      });

      const patternTest = authPatternTest([{ failedFieldName: 'phone' }]);
      test.each(patternTest.value)(`${patternTest.name}`, async (value) => {
        await patternTest.testFn(request, options, value);
      });

      const typeTest = authTypeTest([
        { failedFieldName: 'name' },
        { failedFieldName: 'phone' },
        { failedFieldName: 'email' },
        { failedFieldName: 'wallet' },
        { failedFieldName: 'profile' },
        { parentFieldName: 'profile', failedFieldName: 'title' },
        { parentFieldName: 'profile', failedFieldName: 'description' },
        { parentFieldName: 'profile', failedFieldName: 'image' },
        { parentFieldName: 'profile', failedFieldName: 'background' },
      ]);
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'update');
      });
    });
  });

  describe('DELETE to /auth/remove', () => {
    let options: TestOptions;

    beforeAll(() => {
      options = { method: 'delete', url: '/auth/remove' };
    });

    it('returns 204 if remove is successful', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const res = await request.delete(`/auth/remove`, {
        headers: { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token },
      });
      expect(res.status).toBe(204);
    });

    test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
      await testFn(request, options, null, 'remove');
    });
  });

  describe('PUT to /auth/wakeup', () => {
    let options: TestOptions;

    beforeAll(() => {
      options = { method: 'put', url: '/auth/wakeup', data: {} };
    });

    it('returns 204 if wakeup is successful', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const res = await request.put(
        `/auth/wakeup`,
        {},
        {
          headers: { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token },
        }
      );
      expect(res.status).toBe(204);
    });

    test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
      await testFn(request, options, null, 'wakeup');
    });
  });

  describe('POST to /auth/token', () => {
    let options: TestOptions;

    beforeAll(() => {
      options = { method: 'post', url: '/auth/token', data: {} };
    });

    it('returns 201 if access token is regenerated successfully', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const res = await request.post(
        `/auth/token`,
        {},
        {
          headers: { 'R-Authorization': `Bearer ${token.refresh}`, [config.csrf.tokenKey]: csrf.token },
        }
      );

      expect(res.status).toBe(201);
      expect(res.data.access.length).toBeGreaterThan(0);
    });

    it('returns 401 if the token is not in the cookie or header', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { 'R-Authorization': `Bearer `, [config.csrf.tokenKey]: csrf.token };
      const res = await request.post(
        `/auth/token`,
        {},
        {
          headers,
        }
      );
      expect(res.status).toBe(401);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.NULL_ARGS, 'R-Authorization token should not be null', 401)])
      );
    });

    it('returns 401 if the token is invalid', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);
      const fakeToken = token.refresh.slice(0, -1) + faker.string.alpha();

      const headers = {
        'R-Authorization': `Bearer ${fakeToken}`,
        [config.csrf.tokenKey]: csrf.token,
      };
      const res = await request.post(
        `/auth/token`,
        {},
        {
          headers,
        }
      );

      expect(res.status).toBe(401);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.INVALID_VALUE, 'Refresh token is invalid', 401)])
      );
    });

    it('returns 401 if there is no Authorization header in the request', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = {
        [config.csrf.tokenKey]: csrf.token,
      };
      const res = await request.post(
        `/auth/token`,
        {},
        {
          headers,
        }
      );

      expect(res.status).toBe(401);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.INVALID_VALUE, 'R-Authorization header required', 401)])
      );
    });

    it('returns 401 unless it is in Bearer format', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = {
        'R-Authorization': 'Basic ',
        [config.csrf.tokenKey]: csrf.token,
      };
      const res = await request.post(
        `/auth/token`,
        {},
        {
          headers,
        }
      );

      expect(res.status).toBe(401);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.INVALID_VALUE, `R-Authorization header with scheme 'Bearer' required`, 401),
        ])
      );
    });

    test.each(csrfMiddleWareTest)('$name', async ({ name, testFn }) => {
      await testFn(request, options, null, 'token');
    });
  });
});
