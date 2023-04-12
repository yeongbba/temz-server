import axios, { AxiosInstance } from 'axios';
import {
  authFormatTest,
  authMaxLengthTest,
  authMiddleWareTest,
  authMinLengthTest,
  authMissingTest,
  createNewUser,
  csrfMiddleWareTest,
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

    const missingTest = authMissingTest([{ failedFieldName: 'name' }]);
    test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
      await missingTest.testFn(
        request,
        {
          method: 'get',
          url: '/auth/check-name',
          data: {},
        },
        value
      );
    });

    const minLengthTest = authMinLengthTest([{ failedFieldName: 'name' }]);
    test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
      await minLengthTest.testFn(
        request,
        {
          method: 'get',
          url: '/auth/check-name',
          params: {
            name: faker.random.alpha({ count: 2 }),
          },
        },
        value
      );
    });

    const maxLengthTest = authMaxLengthTest([{ failedFieldName: 'name' }]);
    test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
      await maxLengthTest.testFn(
        request,
        {
          method: 'get',
          url: '/auth/check-name',
          params: {
            name: faker.random.alpha({ count: 26 }),
          },
        },
        value
      );
    });
  });

  describe('GET to /auth/me', () => {
    it('returns 200 and user if user exist', async () => {
      const { token, user } = await loginUser(request);

      const res = await request.get(`/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      expect(res.data).toEqual({
        user,
      });
    });

    test.each(authMiddleWareTest)('$name', async ({ name, testFn }) => {
      await testFn(request, { method: 'get', url: '/auth/me' }, null, 'me');
    });
  });

  describe('GET to /auth/csrf', () => {
    it('returns 200 and csrf token', async () => {
      const { token } = await loginUser(request);

      const res = await request.get(`/auth/csrf`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      expect(res.data.token.length).toBeGreaterThan(0);
    });

    test.each(authMiddleWareTest)('$name', async ({ name, testFn }) => {
      await testFn(request, { method: 'get', url: '/auth/csrf' }, null, 'csrf');
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

    const missingTest = authMissingTest();
    test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
      const user = fakeUser(false);
      await missingTest.testFn(
        request,
        {
          method: 'post',
          url: '/auth/signup',
          data: user,
        },
        value
      );
    });

    const minLengthTest = authMinLengthTest();
    test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
      const user = fakeUser(false);
      await minLengthTest.testFn(
        request,
        {
          method: 'post',
          url: '/auth/signup',
          data: user,
        },
        value
      );
    });

    const maxLengthTest = authMaxLengthTest();
    test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
      const user = fakeUser(false);
      await maxLengthTest.testFn(
        request,
        {
          method: 'post',
          url: '/auth/signup',
          data: user,
        },
        value
      );
    });

    const formatTest = authFormatTest();
    test.each(formatTest.value)(`${formatTest.name}`, async (value) => {
      const user = fakeUser(false);

      await formatTest.testFn(
        request,
        {
          method: 'post',
          url: '/auth/signup',
          data: user,
        },
        value
      );
    });

    test.each([
      {
        failedFieldName: 'phone',
        value: faker.phone.number('011########'),
        pattern: '^(010)(\\d{4})(\\d{4})$',
      },
      {
        failedFieldName: 'password',
        value: faker.random.alphaNumeric(10),
        pattern: '(?=.*[0-9])(?=.*[a-z])(?=.*\\W)(?=\\S+$).{8,20}',
      },
    ])(`returns 400 when $failedFieldName field is wrong pattern`, async ({ failedFieldName, value, pattern }) => {
      const user = fakeUser(false);

      user[failedFieldName] = value;

      const res = await request.post('/auth/signup', user);

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.PATTERN_OPENAPI, `must match pattern "${pattern}"`, 400, failedFieldName),
        ])
      );
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
      expect(res.data.token.length).toBeGreaterThan(0);
      expect(res.data.user).toMatchObject({
        isValid: true,
        name: user.name,
        phone: user.phone,
        profile: user.profile,
        email: user.email,
        wallet: user.wallet,
        createdAt: expect.stringMatching(DATE_REGEX),
        updatedAt: expect.stringMatching(DATE_REGEX),
      });
    });

    it('returns 401 when username is not found', async () => {
      const randomName = faker.random.alpha({ count: 10 });
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

    const missingTest = authMissingTest([{ failedFieldName: 'name' }, { failedFieldName: 'password' }]);
    test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
      const user = await createNewUser(request);

      await missingTest.testFn(
        request,
        {
          method: 'post',
          url: '/auth/login',
          data: {
            name: user.name,
            password: user.password,
          },
        },
        value
      );
    });

    const minLengthTest = authMinLengthTest([{ failedFieldName: 'name' }]);
    test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
      const user = await createNewUser(request);

      await minLengthTest.testFn(
        request,
        {
          method: 'post',
          url: '/auth/login',
          data: {
            name: faker.random.alpha({ count: 2 }),
            password: user.password,
          },
        },
        value
      );
    });

    const maxLengthTest = authMaxLengthTest([{ failedFieldName: 'name' }]);
    test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
      const user = await createNewUser(request);

      await maxLengthTest.testFn(
        request,
        {
          method: 'post',
          url: '/auth/login',
          data: {
            name: faker.random.alpha({ count: 26 }),
            password: user.password,
          },
        },
        value
      );
    });

    it(`returns 400 when password field is wrong pattern`, async () => {
      const user = await createNewUser(request);

      const res = await request.post('/auth/login', {
        name: user.name,
        password: faker.random.alphaNumeric(10),
      });

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(
            ErrorCode.PATTERN_OPENAPI,
            `must match pattern "(?=.*[0-9])(?=.*[a-z])(?=.*\\W)(?=\\S+$).{8,20}"`,
            400,
            'password'
          ),
        ])
      );
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

    const missingTest = authMissingTest([{ failedFieldName: 'phone' }]);
    test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
      await missingTest.testFn(
        request,
        {
          method: 'post',
          url: '/auth/find-name',
          data: {},
        },
        value
      );
    });

    it('returns 400 when phone field is wrong pattern', async () => {
      const phone = faker.phone.number('011########');
      const res = await request.post(`/auth/find-name`, { phone });

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.PATTERN_OPENAPI, `must match pattern "^(010)(\\d{4})(\\d{4})$"`, 400, 'phone'),
        ])
      );
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
      const name = faker.random.alpha({ count: 15 });

      const res = await request.post(`/auth/reset-password`, {
        name,
        password: '12!' + faker.internet.password(),
      });

      expect(res.status).toBe(404);
      expect(res.data).toEqual(fakeFailures([new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404)]));
    });

    const missingTest = authMissingTest([{ failedFieldName: 'name' }, { failedFieldName: 'password' }]);
    test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
      const user = await createNewUser(request);

      await missingTest.testFn(
        request,
        {
          method: 'post',
          url: '/auth/reset-password',
          data: {
            name: user.name,
            password: user.password,
          },
        },
        value
      );
    });

    const minLengthTest = authMinLengthTest([{ failedFieldName: 'name' }]);
    test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
      const user = await createNewUser(request);

      await minLengthTest.testFn(
        request,
        {
          method: 'post',
          url: '/auth/reset-password',
          data: {
            name: faker.random.alpha({ count: 2 }),
            password: user.password,
          },
        },
        value
      );
    });

    const maxLengthTest = authMaxLengthTest([{ failedFieldName: 'name' }]);
    test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
      const user = await createNewUser(request);

      await maxLengthTest.testFn(
        request,
        {
          method: 'post',
          url: '/auth/reset-password',
          data: {
            name: faker.random.alpha({ count: 26 }),
            password: user.password,
          },
        },
        value
      );
    });

    it(`returns 400 when password field is wrong pattern`, async () => {
      const user = await createNewUser(request);

      const res = await request.post('/auth/reset-password', {
        name: user.name,
        password: faker.random.alphaNumeric(10),
      });

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(
            ErrorCode.PATTERN_OPENAPI,
            `must match pattern "(?=.*[0-9])(?=.*[a-z])(?=.*\\W)(?=\\S+$).{8,20}"`,
            400,
            'password'
          ),
        ])
      );
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
        name: faker.random.alpha({ count: 15 }),
        phone: user.phone,
      });

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.INVALID_VALUE, 'Name does not match the owner of the phone', 400)])
      );
    });

    const missingTest = authMissingTest([{ failedFieldName: 'name' }, { failedFieldName: 'phone' }]);
    test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
      const user = await createNewUser(request);

      await missingTest.testFn(
        request,
        {
          method: 'post',
          url: '/auth/check-phone',
          data: {
            name: user.name,
            phone: user.phone,
          },
        },
        value
      );
    });

    const minLengthTest = authMinLengthTest([{ failedFieldName: 'name' }]);
    test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
      const user = await createNewUser(request);

      await minLengthTest.testFn(
        request,
        {
          method: 'post',
          url: '/auth/check-phone',
          data: {
            name: faker.random.alpha({ count: 2 }),
            phone: user.phone,
          },
        },
        value
      );
    });

    const maxLengthTest = authMaxLengthTest([{ failedFieldName: 'name' }]);
    test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
      const user = await createNewUser(request);

      await maxLengthTest.testFn(
        request,
        {
          method: 'post',
          url: '/auth/check-phone',
          data: {
            name: faker.random.alpha({ count: 26 }),
            phone: user.phone,
          },
        },
        value
      );
    });

    it(`returns 400 when phone field is wrong pattern`, async () => {
      const user = await createNewUser(request);

      const res = await request.post(`/auth/check-phone`, {
        name: user.name,
        phone: faker.phone.number('011########'),
      });

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.PATTERN_OPENAPI, `must match pattern "^(010)(\\d{4})(\\d{4})$"`, 400, 'phone'),
        ])
      );
    });
  });

  describe('POST to /auth/logout', () => {
    it('returns 201 if logout is successful', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const res = await request.post(
        `/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token },
        }
      );
      expect(res.status).toBe(201);
    });

    test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
      await testFn(request, { method: 'post', url: '/auth/logout', data: {} }, null, 'logout');
    });
  });

  describe('PUT to /auth/update', () => {
    it('returns 204 if update is successful', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);
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
          headers: { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token },
        }
      );
      expect(res.status).toBe(204);
    });

    const missingTest = authMissingTest([
      { failedFieldName: 'name' },
      { failedFieldName: 'phone' },
      { failedFieldName: 'profile' },
      { parentFieldName: 'profile', failedFieldName: 'title' },
    ]);
    test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
      const updateUser = fakeUser(false);

      await missingTest.testFn(
        request,
        {
          method: 'put',
          url: '/auth/update',
          data: {
            name: updateUser.name,
            profile: updateUser.profile,
            email: updateUser.email,
            phone: updateUser.phone,
            wallet: updateUser.wallet,
          },
        },
        value
      );
    });

    const minLengthTest = authMinLengthTest();
    test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
      const updateUser = fakeUser(false);
      await minLengthTest.testFn(
        request,
        {
          method: 'put',
          url: '/auth/update',
          data: {
            name: updateUser.name,
            profile: updateUser.profile,
            email: updateUser.email,
            phone: updateUser.phone,
            wallet: updateUser.wallet,
          },
        },
        value
      );
    });

    const maxLengthTest = authMaxLengthTest();
    test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
      const updateUser = fakeUser(false);
      await maxLengthTest.testFn(
        request,
        {
          method: 'put',
          url: '/auth/update',
          data: {
            name: updateUser.name,
            profile: updateUser.profile,
            email: updateUser.email,
            phone: updateUser.phone,
            wallet: updateUser.wallet,
          },
        },
        value
      );
    });

    const formatTest = authFormatTest();
    test.each(formatTest.value)(`${formatTest.name}`, async (value) => {
      const updateUser = fakeUser(false);

      await formatTest.testFn(
        request,
        {
          method: 'put',
          url: '/auth/update',
          data: {
            name: updateUser.name,
            profile: updateUser.profile,
            email: updateUser.email,
            phone: updateUser.phone,
            wallet: updateUser.wallet,
          },
        },
        value
      );
    });

    test.each([
      {
        failedFieldName: 'phone',
        value: faker.phone.number('011########'),
        pattern: '^(010)(\\d{4})(\\d{4})$',
      },
    ])(`returns 400 when $failedFieldName field is wrong pattern`, async ({ failedFieldName, value, pattern }) => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);
      const updateUser = fakeUser(false);

      updateUser[failedFieldName] = value;

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
          headers: { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token },
        }
      );

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.PATTERN_OPENAPI, `must match pattern "${pattern}"`, 400, failedFieldName),
        ])
      );
    });

    test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
      const updateUser = fakeUser(false);
      await testFn(
        request,
        {
          method: 'put',
          url: '/auth/update',
          data: {
            name: updateUser.name,
            profile: updateUser.profile,
            email: updateUser.email,
            phone: updateUser.phone,
            wallet: updateUser.wallet,
          },
        },
        null,
        'update'
      );
    });
  });

  describe('DELETE to /auth/remove', () => {
    it('returns 204 if remove is successful', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const res = await request.delete(`/auth/remove`, {
        headers: { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token },
      });
      expect(res.status).toBe(204);
    });

    test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
      await testFn(request, { method: 'delete', url: '/auth/remove' }, null, 'remove');
    });
  });
});
