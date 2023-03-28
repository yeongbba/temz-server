import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { config } from '../../config';
import { ErrorCode } from '../../types/error.util';
import { FailureObject } from '../error.util';
import { fakeFailures } from './error.util';

export const DATE_REGEX = /[1-9]\d{3}-(0[1-9]|1[0-2])-(3[0-1]|[1-2]\d|0[1-9])T(0\d|1\d|2[0-3])(:[0-5]\d){2}.\d{3}Z/;

export const fakeUser = (useId: boolean = true) => ({
  id: useId ? '63ff1389cbf2d80a9db01b49' : undefined,
  name: faker.internet.userName(),
  password: '12!' + faker.internet.password(),
  phone: faker.phone.number('010########'),
  email: faker.internet.email(),
  profile: {
    title: faker.internet.userName(),
    description: faker.random.words(3),
    image: faker.internet.avatar(),
    background: faker.internet.avatar(),
  },
  wallet: `0x${faker.random.numeric(40)}`,
});

export const createNewUser = async (request) => {
  const user = fakeUser(false);
  await request.post('/auth/signup', user);
  return {
    ...user,
  };
};

export const loginUser = async (request: AxiosInstance) => {
  const user = fakeUser(false);

  await request.post('/auth/signup', user);

  const login = await request.post('/auth/login', {
    name: user.name,
    password: user.password,
  });

  return login.data;
};

export const csrfToken = async (request: AxiosInstance, token: string) => {
  const csrf = await request.get(`/auth/csrf`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return csrf.data;
};

export const csrfMiddleWareTest = [
  {
    name: 'returns 401 if there is no csrf header in the request',
    testFn: async (
      request: AxiosInstance,
      options: {
        method: Method;
        url: string;
        data?: any;
      },
      reason?: string
    ) => {
      const { token } = await loginUser(request);

      const headers = { Authorization: `Bearer ${token}` };
      const res = await sendRequest(request, options, {
        headers,
      });

      expect(res.status).toBe(401);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.INVALID_VALUE, `'${config.csrf.tokenKey}' header required`, 401, reason),
        ])
      );
    },
  },
  {
    name: 'returns 403 if the token is invalid',
    testFn: async (
      request: AxiosInstance,
      options: {
        method: Method;
        url: string;
        data?: any;
      },
      reason?: string
    ) => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = {
        Authorization: `Bearer ${token}`,
        [config.csrf.tokenKey]: csrf.token.slice(0, -1) + faker.random.alpha(),
      };
      const res = await sendRequest(request, options, {
        headers,
      });

      expect(res.status).toBe(403);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.INVALID_VALUE, 'Csrf token is invalid', 403, reason)])
      );
    },
  },
];

export const authMiddleWareTest = [
  {
    name: 'returns 401 if the token is not in the cookie or header',
    testFn: async (
      request: AxiosInstance,
      options: {
        method: Method;
        url: string;
        data?: any;
      },
      reason?: string
    ) => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer `, [config.csrf.tokenKey]: csrf.token };
      const res = await sendRequest(request, options, {
        headers,
      });

      expect(res.status).toBe(401);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.INVALID_VALUE, 'Authentication token should not be null', 401, reason),
        ])
      );
    },
  },
  {
    name: 'returns 401 if the token is malformed',
    testFn: async (
      request: AxiosInstance,
      options: {
        method: Method;
        url: string;
        data?: any;
      },
      reason?: string
    ) => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${faker.random.alphaNumeric(4)}`, [config.csrf.tokenKey]: csrf.token };
      const res = await sendRequest(request, options, {
        headers,
      });

      expect(res.status).toBe(401);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.INVALID_VALUE, 'jwt malformed', 401, reason)])
      );
    },
  },
  {
    name: 'returns 401 if the token is invalid',
    testFn: async (
      request: AxiosInstance,
      options: {
        method: Method;
        url: string;
        data?: any;
      },
      reason?: string
    ) => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);
      const fakeToken = token.slice(0, -1) + faker.random.alpha();

      const headers = {
        Authorization: `Bearer ${fakeToken}`,
        [config.csrf.tokenKey]: csrf.token,
      };
      const res = await sendRequest(request, options, {
        headers,
      });

      expect(res.status).toBe(401);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.INVALID_VALUE, 'invalid signature', 401, reason)])
      );
    },
  },
  {
    name: 'returns 401 if there is no Authorization header in the request',
    testFn: async (
      request: AxiosInstance,
      options: {
        method: Method;
        url: string;
        data?: any;
      },
      reason?: string
    ) => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = {
        [config.csrf.tokenKey]: csrf.token,
      };
      const res = await sendRequest(request, options, headers);

      expect(res.status).toBe(401);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.INVALID_VALUE, 'Authorization header required', 401, reason)])
      );
    },
  },
  {
    name: 'returns 401 unless it is in Bearer format',
    testFn: async (
      request: AxiosInstance,
      options: {
        method: Method;
        url: string;
        data?: any;
      },
      reason?: string
    ) => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = {
        Authorization: 'Basic ',
        [config.csrf.tokenKey]: csrf.token,
      };
      const res = await sendRequest(request, options, {
        headers,
      });

      expect(res.status).toBe(401);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.INVALID_VALUE, `Authorization header with scheme 'Bearer' required`, 401, reason),
        ])
      );
    },
  },
  {
    name: 'returns 401 if token is expired',
    testFn: async (
      request: AxiosInstance,
      options: {
        method: Method;
        url: string;
        data?: any;
      },
      reason?: string
    ) => {
      const { token, user } = await loginUser(request);
      const csrf = await csrfToken(request, token);
      const expiredToken = jwt.sign({ id: user.userId }, config.jwt.secretKey, {
        expiresIn: 0,
      });

      const headers = {
        Authorization: `Bearer ${expiredToken}`,
        [config.csrf.tokenKey]: csrf.token,
      };

      const res = await sendRequest(request, options, {
        headers,
      });

      expect(res.status).toBe(401);
      expect(res.data).toEqual(fakeFailures([new FailureObject(ErrorCode.INVALID_VALUE, `jwt expired`, 401, reason)]));
    },
  },
];

const sendRequest = async (
  request: AxiosInstance,
  options: {
    method: Method;
    url: string;
    data?: any;
  },
  config?: AxiosRequestConfig
): Promise<AxiosResponse<any, any>> => {
  const { method, url, data } = options;
  if (data) {
    return request[method](url, data, config);
  } else {
    return request[method](url, config);
  }
};
