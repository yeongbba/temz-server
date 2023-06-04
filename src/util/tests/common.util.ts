import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { config } from '../../config';
import {
  AllTestValueType,
  FormatValue,
  ItemCountValue,
  MaximumValue,
  MaxLengthValue,
  MinimumValue,
  MinLengthValue,
  MissingValue,
  PatternValue,
  TestFunction,
  TestOptions,
  TypeValue,
} from '../../types/common';
import { ErrorCode } from '../../types/error.util';
import { FailureObject } from '../error.util';
import { csrfToken, loginUser } from './auth.util';
import { fakeFailures } from './error.util';

export const sendRequest = async (
  request: AxiosInstance,
  options: {
    method: Method;
    url: string;
    data?: any;
    params?: any;
  },
  config: AxiosRequestConfig = {}
): Promise<AxiosResponse<any, any>> => {
  const { method, url, data, params } = options;
  config.params = params;

  if (data) {
    return request[method](url, data, config);
  } else {
    return request[method](url, config);
  }
};

export const setCurrentField = (parentFieldName: string, rootField: object) => {
  let currentField = rootField;
  parentFieldName.split('.').forEach((field) => {
    if (Array.isArray(currentField[field])) {
      currentField = currentField[field][0];
    } else {
      currentField = currentField[field];
    }
  });

  return currentField;
};

export const setRootField = (options: TestOptions) => {
  return options.params || options.data;
};

export const filterFields = <T extends AllTestValueType>(
  fields: T[],
  selectedFields?: { parentFieldName?: string; failedFieldName: string }[]
) =>
  selectedFields
    ? fields.filter((field) =>
        selectedFields.find(
          (selectedField) =>
            field.failedFieldName === selectedField.failedFieldName &&
            field.parentFieldName === selectedField.parentFieldName
        )
      )
    : fields;

export const testFn = (test: TestFunction) => {
  return async (request: AxiosInstance, options: TestOptions, value: AllTestValueType | null, reason?: string) => {
    await test(request, options, value, reason);
  };
};

export const csrfMiddleWareTest = [
  {
    name: 'returns 401 if there is no csrf header in the request',
    testFn: testFn(async (request, options, value, reason) => {
      const { token } = await loginUser(request);

      const headers = { Authorization: `Bearer ${token.access}` };
      const res = await sendRequest(request, options, {
        headers,
      });

      expect(res.status).toBe(401);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.INVALID_VALUE, `'${config.csrf.tokenKey}' header required`, 401, reason),
        ])
      );
    }),
  },
  {
    name: 'returns 403 if the token is invalid',
    testFn: testFn(async (request, options, value, reason) => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = {
        Authorization: `Bearer ${token.access}`,
        [config.csrf.tokenKey]: csrf.token.slice(0, -1) + faker.random.alpha(),
      };
      const res = await sendRequest(request, options, {
        headers,
      });

      expect(res.status).toBe(403);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.INVALID_VALUE, 'Csrf token is invalid', 403, reason)])
      );
    }),
  },
];

export const authMiddleWareTest = [
  {
    name: 'returns 401 if the token is not in the cookie or header',
    testFn: testFn(async (request, options, value, reason) => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer `, [config.csrf.tokenKey]: csrf.token };
      const res = await sendRequest(request, options, {
        headers,
      });

      expect(res.status).toBe(401);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.INVALID_VALUE, 'Authorization token should not be null', 401, reason),
        ])
      );
    }),
  },
  {
    name: 'returns 401 if the token is malformed',
    testFn: testFn(async (request, options, value, reason) => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${faker.random.alphaNumeric(4)}`, [config.csrf.tokenKey]: csrf.token };
      const res = await sendRequest(request, options, {
        headers,
      });

      expect(res.status).toBe(401);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.INVALID_VALUE, 'jwt malformed', 401, reason)])
      );
    }),
  },
  {
    name: 'returns 401 if the token is invalid',
    testFn: testFn(async (request, options, value, reason) => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);
      const fakeToken = token.access.slice(0, -1) + faker.random.alpha();

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
    }),
  },
  {
    name: 'returns 401 if there is no Authorization header in the request',
    testFn: testFn(async (request, options, value, reason) => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = {
        [config.csrf.tokenKey]: csrf.token,
      };
      const res = await sendRequest(request, options, headers);

      expect(res.status).toBe(401);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.INVALID_VALUE, 'Authorization header required', 401, reason)])
      );
    }),
  },
  {
    name: 'returns 401 unless it is in Bearer format',
    testFn: testFn(async (request, options, value, reason) => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

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
    }),
  },
  {
    name: 'returns 401 if token is expired',
    testFn: testFn(async (request, options, value, reason) => {
      const { token, user } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);
      const expiredToken = jwt.sign({ id: user.userId }, config.jwt.accessSecretKey, {
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
    }),
  },
];

export const itemCountTest = (value: ItemCountValue[]) => ({
  value,
  name: 'returns 400 when $failedFieldName field exceed max item count',
  testFn: testFn(async (request, options, value) => {
    const { parentFieldName, failedFieldName, maxItems } = value as ItemCountValue;
    const rootField = setRootField(options);
    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token.access);
    let array = [];
    let item = null;

    if (parentFieldName) {
      const currentField = setCurrentField(parentFieldName, rootField);
      array = currentField[failedFieldName];
      item = currentField[failedFieldName][0];
    } else {
      array = rootField[failedFieldName];
      item = rootField[failedFieldName][0];
    }

    for (let i = 0; i <= maxItems; i++) {
      if (item) {
        array.push(item);
      }
    }

    const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };
    const res = await sendRequest(request, options, {
      headers,
    });

    expect(res.status).toBe(400);
    expect(res.data).toEqual(
      fakeFailures([
        new FailureObject(
          ErrorCode.MAXITEMS_OPENAPI,
          `must NOT have more than ${maxItems} items`,
          400,
          failedFieldName
        ),
      ])
    );
  }),
});

export const typeTest = (value: TypeValue[]) => ({
  value,
  name: 'returns 400 when $failedFieldName field is wrong type',
  testFn: testFn(async (request, options, value) => {
    const { parentFieldName, failedFieldName, fakeValue, type, format, item } = value as TypeValue;
    const rootField = setRootField(options);
    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token.access);
    if (parentFieldName) {
      const currentField = setCurrentField(parentFieldName, rootField);

      if (item) {
        currentField[failedFieldName].unshift(fakeValue);
      } else {
        currentField[failedFieldName] = fakeValue;
      }
    } else {
      if (item) {
        rootField[failedFieldName].unshift(fakeValue);
      } else {
        rootField[failedFieldName] = fakeValue;
      }
    }

    const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };
    const res = await sendRequest(request, options, {
      headers,
    });

    const errorCode = format === 'date' ? ErrorCode.X_EOV_TYPE_OPENAPI : ErrorCode.TYPE_OPENAPI;
    expect(res.status).toBe(400);
    expect(res.data).toEqual(
      fakeFailures([new FailureObject(errorCode, `must be ${type}`, 400, item ? '0' : failedFieldName)])
    );
  }),
});

export const maxLengthTest = (value: MaxLengthValue[]) => ({
  value,
  name: 'returns 400 when $failedFieldName field length is too long',
  testFn: testFn(async (request, options, value) => {
    const { parentFieldName, failedFieldName, fakeValue, maxLength } = value as MaxLengthValue;
    const rootField = setRootField(options);
    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token.access);

    if (parentFieldName) {
      const currentField = setCurrentField(parentFieldName, rootField);
      currentField[failedFieldName] = fakeValue;
    } else {
      rootField[failedFieldName] = fakeValue;
    }

    const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };
    const res = await sendRequest(request, options, {
      headers,
    });

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
  }),
});

export const minLengthTest = (value: MinLengthValue[]) => ({
  value,
  name: 'returns 400 when $failedFieldName field length is too long',
  testFn: testFn(async (request, options, value) => {
    const { parentFieldName, failedFieldName, fakeValue, minLength } = value as MinLengthValue;
    const rootField = setRootField(options);
    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token.access);

    if (parentFieldName) {
      const currentField = setCurrentField(parentFieldName, rootField);
      currentField[failedFieldName] = fakeValue;
    } else {
      rootField[failedFieldName] = fakeValue;
    }

    const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };
    const res = await sendRequest(request, options, {
      headers,
    });

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
  }),
});

export const formatTest = (value: FormatValue[]) => ({
  value,
  name: 'returns 400 when $failedFieldName field is wrong format',
  testFn: testFn(async (request, options, value) => {
    const { parentFieldName, failedFieldName, fakeValue, format, item } = value as FormatValue;
    const rootField = setRootField(options);

    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token.access);
    if (parentFieldName) {
      const currentField = setCurrentField(parentFieldName, rootField);

      if (item) {
        currentField[failedFieldName].unshift(fakeValue);
      } else {
        currentField[failedFieldName] = fakeValue;
      }
    } else {
      if (item) {
        rootField[failedFieldName].unshift(fakeValue);
      } else {
        rootField[failedFieldName] = fakeValue;
      }
    }

    const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };
    const res = await sendRequest(request, options, {
      headers,
    });

    expect(res.status).toBe(400);
    expect(res.data).toEqual(
      fakeFailures([
        new FailureObject(ErrorCode.FORMAT_OPENAPI, `must match format "${format}"`, 400, item ? '0' : failedFieldName),
      ])
    );
  }),
});

export const patternTest = (value: PatternValue[]) => ({
  value,
  name: 'returns 400 when $failedFieldName field is wrong pattern',
  testFn: testFn(async (request, options, value) => {
    const { parentFieldName, failedFieldName, fakeValue, pattern } = value as PatternValue;
    const rootField = setRootField(options);

    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token.access);
    if (parentFieldName) {
      const currentField = setCurrentField(parentFieldName, rootField);
      currentField[failedFieldName] = fakeValue;
    } else {
      rootField[failedFieldName] = fakeValue;
    }

    const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };
    const res = await sendRequest(request, options, {
      headers,
    });

    expect(res.status).toBe(400);
    expect(res.data).toEqual(
      fakeFailures([
        new FailureObject(ErrorCode.PATTERN_OPENAPI, `must match pattern "${pattern}"`, 400, failedFieldName),
      ])
    );
  }),
});

export const missingTest = (value: MissingValue[]) => ({
  value,
  name: 'returns 400 when $failedFieldName field is missing',
  testFn: testFn(async (request, options, value) => {
    const { parentFieldName, failedFieldName } = value as MissingValue;
    const rootField = setRootField(options);

    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token.access);
    if (parentFieldName) {
      const currentField = setCurrentField(parentFieldName, rootField);
      delete currentField[failedFieldName];
    } else {
      delete rootField[failedFieldName];
    }

    const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };
    const res = await sendRequest(request, options, {
      headers,
    });

    expect(res.status).toBe(400);
    expect(res.data).toEqual(
      fakeFailures([
        new FailureObject(
          ErrorCode.REQUIRED_OPENAPI,
          `must have required property '${failedFieldName}'`,
          400,
          failedFieldName
        ),
      ])
    );
  }),
});

export const maximumTest = (value: MaximumValue[]) => ({
  value,
  name: 'returns 400 when $failedFieldName field exceeds the maximum',
  testFn: testFn(async (request, options, value) => {
    const { parentFieldName, failedFieldName, fakeValue, maximum } = value as MaximumValue;
    const rootField = setRootField(options);
    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token.access);

    if (parentFieldName) {
      const currentField = setCurrentField(parentFieldName, rootField);
      currentField[failedFieldName] = fakeValue;
    } else {
      rootField[failedFieldName] = fakeValue;
    }

    const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };
    const res = await sendRequest(request, options, {
      headers,
    });

    expect(res.status).toBe(400);
    expect(res.data).toEqual(
      fakeFailures([new FailureObject(ErrorCode.MAXIMUM_OPENAPI, `must be <= ${maximum}`, 400, failedFieldName)])
    );
  }),
});

export const minimumTest = (value: MinimumValue[]) => ({
  value,
  name: 'returns 400 when $failedFieldName field is lower than the minimum',
  testFn: testFn(async (request, options, value) => {
    const { parentFieldName, failedFieldName, fakeValue, minimum } = value as MinimumValue;
    const rootField = setRootField(options);
    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token.access);

    if (parentFieldName) {
      const currentField = setCurrentField(parentFieldName, rootField);
      currentField[failedFieldName] = fakeValue;
    } else {
      rootField[failedFieldName] = fakeValue;
    }

    const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };
    const res = await sendRequest(request, options, {
      headers,
    });

    expect(res.status).toBe(400);
    expect(res.data).toEqual(
      fakeFailures([new FailureObject(ErrorCode.MINIMUM_OPENAPI, `must be >= ${minimum}`, 400, failedFieldName)])
    );
  }),
});
