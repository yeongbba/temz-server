import { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { config } from '../../config';
import {
  AllTestValueType,
  formatValue,
  ItemCountValue,
  maxLengthValue,
  missingValue,
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

export const testFn = (test: TestFunction) => {
  return async (request: AxiosInstance, options: TestOptions, value: AllTestValueType | null, reason?: string) => {
    await test(request, options, value, reason);
  };
};

export const itemCountTest = (value: ItemCountValue[]) => ({
  value,
  name: 'returns 400 when $failedFieldName field exceed max item count',
  testFn: testFn(async (request, options, value) => {
    const { parentFieldName, failedFieldName, maxItems } = value as ItemCountValue;
    const rootField = setRootField(options);
    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token);
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

    const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
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
    const { parentFieldName, failedFieldName, fakeValue, type, item } = value as TypeValue;
    const rootField = setRootField(options);
    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token);
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

    const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
    const res = await sendRequest(request, options, {
      headers,
    });

    expect(res.status).toBe(400);
    expect(res.data).toEqual(
      fakeFailures([new FailureObject(ErrorCode.TYPE_OPENAPI, `must be ${type}`, 400, item ? '0' : failedFieldName)])
    );
  }),
});

export const maxLengthTest = (value: maxLengthValue[]) => ({
  value,
  name: 'returns 400 when $failedFieldName field length is too long',
  testFn: testFn(async (request, options, value) => {
    const { parentFieldName, failedFieldName, fakeValue, maxLength } = value as maxLengthValue;
    const rootField = setRootField(options);
    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token);

    if (parentFieldName) {
      const currentField = setCurrentField(parentFieldName, rootField);
      currentField[failedFieldName] = fakeValue;
    } else {
      rootField[failedFieldName] = fakeValue;
    }

    const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
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

export const formatTest = (value: formatValue[]) => ({
  value,
  name: 'returns 400 when $failedFieldName field is wrong format',
  testFn: testFn(async (request, options, value) => {
    const { parentFieldName, failedFieldName, fakeValue, format } = value as formatValue;
    const rootField = setRootField(options);

    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token);
    if (parentFieldName) {
      const currentField = setCurrentField(parentFieldName, rootField);
      currentField[failedFieldName] = fakeValue;
    } else {
      rootField[failedFieldName] = fakeValue;
    }

    const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
    const res = await sendRequest(request, options, {
      headers,
    });

    expect(res.status).toBe(400);
    expect(res.data).toEqual(
      fakeFailures([new FailureObject(ErrorCode.FORMAT_OPENAPI, `must match format "${format}"`, 400, failedFieldName)])
    );
  }),
});

export const missingTest = (value: missingValue[]) => ({
  value,
  name: 'returns 400 when $missingFieldName field is missing',
  testFn: testFn(async (request, options, value) => {
    const { parentFieldName, failedFieldName } = value as missingValue;
    const rootField = setRootField(options);

    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token);
    if (parentFieldName) {
      const currentField = setCurrentField(parentFieldName, rootField);
      delete currentField[failedFieldName];
    } else {
      delete rootField[failedFieldName];
    }

    const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
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
