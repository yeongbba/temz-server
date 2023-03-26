import axios, { AxiosInstance } from 'axios';
import { createNewUser, DATE_REGEX, fakeUser, loginUser } from '../../util/tests/auth.util';
import { AddressInfo } from 'net';
import { Index } from '../..';
import { FailureObject } from '../../util/error.util';
import { ErrorCode } from '../../types/error.util';
import { faker } from '@faker-js/faker';
import { fakeFailures } from '../../util/tests/error.util';

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

    it('returns 400 when name param is missing', async () => {
      const res = await request.get(`/auth/check-name`);

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.REQUIRED_OPENAPI, `must have required property 'name'`, 400, 'name')])
      );
    });

    it('returns 400 when name param length is too short', async () => {
      const res = await request.get(`/auth/check-name`, {
        params: {
          name: faker.random.alpha({ count: 2 }),
        },
      });

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.MINLENGTH_OPENAPI, `must NOT have fewer than 3 characters`, 400, 'name'),
        ])
      );
    });

    it('returns 400 when name param length is too long', async () => {
      const res = await request.get(`/auth/check-name`, {
        params: {
          name: faker.random.alpha({ count: 26 }),
        },
      });

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.MAXLENGTH_OPENAPI, `must NOT have more than 25 characters`, 400, 'name'),
        ])
      );
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

    test.each([
      { missingFieldName: 'name' },
      { missingFieldName: 'phone' },
      { missingFieldName: 'profile' },
      { parentFieldName: 'profile', missingFieldName: 'title' },
      { missingFieldName: 'password' },
    ])(`returns 400 when $missingFieldName field is missing`, async ({ parentFieldName, missingFieldName }) => {
      const user = fakeUser(false);

      if (parentFieldName) {
        delete user[parentFieldName][missingFieldName];
      } else {
        delete user[missingFieldName];
      }

      const res = await request.post('/auth/signup', user);

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(
            ErrorCode.REQUIRED_OPENAPI,
            `must have required property '${missingFieldName}'`,
            400,
            missingFieldName
          ),
        ])
      );
    });

    test.each([
      { failedFieldName: 'name', value: faker.random.alpha({ count: 2 }), minLength: 3 },
      { failedFieldName: 'wallet', value: faker.random.alphaNumeric(24), minLength: 25 },
    ])(`returns 400 when $failedFieldName field length is too short`, async ({ failedFieldName, value, minLength }) => {
      const user = fakeUser(false);

      user[failedFieldName] = value;

      const res = await request.post('/auth/signup', user);

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(
            ErrorCode.MINLENGTH_OPENAPI,
            `must NOT have fewer than ${minLength} characters`,
            400,
            failedFieldName
          ),
        ])
      );
    });

    test.each([
      { failedFieldName: 'name', value: faker.random.alpha({ count: 26 }), maxLength: 25 },
      { failedFieldName: 'wallet', value: faker.random.alphaNumeric(43), maxLength: 42 },
      { parentFieldName: 'profile', failedFieldName: 'title', value: faker.random.alpha(26), maxLength: 25 },
      { parentFieldName: 'profile', failedFieldName: 'description', value: faker.random.alpha(501), maxLength: 500 },
    ])(
      `returns 400 when $failedFieldName field length is too long`,
      async ({ parentFieldName, failedFieldName, value, maxLength }) => {
        const user = fakeUser(false);

        if (parentFieldName) {
          user[parentFieldName][failedFieldName] = value;
        } else {
          user[failedFieldName] = value;
        }

        const res = await request.post('/auth/signup', user);

        expect(res.status).toBe(400);
        expect(res.data).toEqual(
          fakeFailures([
            new FailureObject(
              ErrorCode.MAXLENGTH_OPENAPI,
              `must NOT have more than ${maxLength} characters`,
              400,
              failedFieldName
            ),
          ])
        );
      }
    );

    test.each([
      { failedFieldName: 'email', value: faker.random.alpha(10), format: 'email' },
      { parentFieldName: 'profile', failedFieldName: 'image', value: faker.random.alpha(10), format: 'url' },
      { parentFieldName: 'profile', failedFieldName: 'background', value: faker.random.alpha(26), format: 'url' },
    ])(
      `returns 400 when $failedFieldName field is wrong format`,
      async ({ parentFieldName, failedFieldName, value, format }) => {
        const user = fakeUser(false);

        if (parentFieldName) {
          user[parentFieldName][failedFieldName] = value;
        } else {
          user[failedFieldName] = value;
        }

        const res = await request.post('/auth/signup', user);

        expect(res.status).toBe(400);
        expect(res.data).toEqual(
          fakeFailures([
            new FailureObject(ErrorCode.FORMAT_OPENAPI, `must match format "${format}"`, 400, failedFieldName),
          ])
        );
      }
    );

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

    test.each([{ missingFieldName: 'name' }, { missingFieldName: 'password' }])(
      `returns 400 when $missingFieldName field is missing`,
      async ({ missingFieldName }) => {
        const user = await createNewUser(request);

        delete user[missingFieldName];

        const res = await request.post('/auth/login', {
          name: user.name,
          password: user.password,
        });

        expect(res.status).toBe(400);
        expect(res.data).toEqual(
          fakeFailures([
            new FailureObject(
              ErrorCode.REQUIRED_OPENAPI,
              `must have required property '${missingFieldName}'`,
              400,
              missingFieldName
            ),
          ])
        );
      }
    );

    it('returns 400 when name length is too short', async () => {
      const user = await createNewUser(request);

      const res = await request.post('/auth/login', {
        name: faker.random.alpha({ count: 2 }),
        password: user.password,
      });

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.MINLENGTH_OPENAPI, `must NOT have fewer than 3 characters`, 400, 'name'),
        ])
      );
    });

    it('returns 400 when name length is too long', async () => {
      const user = await createNewUser(request);

      const res = await request.post('/auth/login', {
        name: faker.random.alpha({ count: 26 }),
        password: user.password,
      });

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.MAXLENGTH_OPENAPI, `must NOT have more than 25 characters`, 400, 'name'),
        ])
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

  describe('GET to /auth/me', () => {
    it('returns 200 and user if user exists', async () => {
      const { token, user } = await loginUser(request);

      const res = await request.get(`/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      expect(res.data).toEqual({
        user,
      });
    });
  });

  describe('GET to /auth/csrf', () => {
    it('returns 200 and csrf token', async () => {
      const { token, user } = await loginUser(request);

      const res = await request.get(`/auth/csrf`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      expect(res.data.token.length).toBeGreaterThan(0);
    });
  });
});
