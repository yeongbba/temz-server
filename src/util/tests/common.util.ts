import { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { config } from '../../config';
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

type ItemCountValue = { parentFieldName?: string; failedFieldName: string; maxItems: number };
export const itemCountTest = (value: ItemCountValue[]) => ({
  value,
  name: 'returns 400 when $failedFieldName field exceed max item count',
  testFn: async (
    request: AxiosInstance,
    options: {
      method: Method;
      url: string;
      data?: any;
      params?: any;
    },
    value: ItemCountValue
  ) => {
    const links = options.data;
    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token);
    let array = [];
    let item = null;

    if (value.parentFieldName) {
      const currentField = setCurrentField(value.parentFieldName, links);
      array = currentField[value.failedFieldName];
      item = currentField[value.failedFieldName][0];
    } else {
      array = links[value.failedFieldName];
      item = links[value.failedFieldName][0];
    }

    for (let i = 0; i <= value.maxItems; i++) {
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
          `must NOT have more than ${value.maxItems} items`,
          400,
          value.failedFieldName
        ),
      ])
    );
  },
});

type TypeValue = { parentFieldName?: string; failedFieldName: string; fakeValue: any; type: string; item?: boolean };
export const typeTest = (value: TypeValue[]) => ({
  value,
  name: 'returns 400 when $failedFieldName field is wrong type',
  testFn: async (
    request: AxiosInstance,
    options: {
      method: Method;
      url: string;
      data?: any;
    },
    value: TypeValue
  ) => {
    const links = options.data;
    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token);
    if (value.parentFieldName) {
      const currentField = setCurrentField(value.parentFieldName, links);

      if (value.item) {
        currentField[value.failedFieldName].unshift(value.fakeValue);
      } else {
        currentField[value.failedFieldName] = value.fakeValue;
      }
    } else {
      if (value.item) {
        links[value.failedFieldName].unshift(value.fakeValue);
      } else {
        links[value.failedFieldName] = value.fakeValue;
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
          ErrorCode.TYPE_OPENAPI,
          `must be ${value.type}`,
          400,
          value.item ? '0' : value.failedFieldName
        ),
      ])
    );
  },
});

type maxLengthValue = { parentFieldName?: string; failedFieldName: string; fakeValue: any; maxLength: number };
export const maxLengthTest = (value: maxLengthValue[]) => ({
  value,
  name: 'returns 400 when $failedFieldName field length is too long',
  testFn: async (
    request: AxiosInstance,
    options: {
      method: Method;
      url: string;
      data?: any;
      params?: any;
    },
    value: maxLengthValue
  ) => {
    const rootField = options.params || options.data;
    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token);
    if (value.parentFieldName) {
      const currentField = setCurrentField(value.parentFieldName, rootField);
      currentField[value.failedFieldName] = value.fakeValue;
    } else {
      rootField[value.failedFieldName] = value.fakeValue;
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
          `must NOT have more than ${value.maxLength} characters`,
          400,
          value.failedFieldName
        ),
      ])
    );
  },
});

type formatValue = { parentFieldName?: string; failedFieldName: string; fakeValue: any; format: string };
export const formatTest = (value: formatValue[]) => ({
  value,
  name: 'returns 400 when $failedFieldName field is wrong format',
  testFn: async (
    request: AxiosInstance,
    options: {
      method: Method;
      url: string;
      data?: any;
    },
    value: formatValue
  ) => {
    const links = options.data;
    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token);
    if (value.parentFieldName) {
      const currentField = setCurrentField(value.parentFieldName, links);
      currentField[value.failedFieldName] = value.fakeValue;
    } else {
      links[value.failedFieldName] = value.fakeValue;
    }

    const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
    const res = await sendRequest(request, options, {
      headers,
    });

    expect(res.status).toBe(400);
    expect(res.data).toEqual(
      fakeFailures([
        new FailureObject(ErrorCode.FORMAT_OPENAPI, `must match format "${value.format}"`, 400, value.failedFieldName),
      ])
    );
  },
});

type missingValue = { parentFieldName?: string; failedFieldName: string };
export const missingTest = (value: missingValue[]) => ({
  value,
  name: 'returns 400 when $missingFieldName field is missing',
  testFn: async (
    request: AxiosInstance,
    options: {
      method: Method;
      url: string;
      data?: any;
    },
    value: missingValue
  ) => {
    const links = options.data;
    const { token } = await loginUser(request);
    const csrf = await csrfToken(request, token);
    if (value.parentFieldName) {
      const currentField = setCurrentField(value.parentFieldName, links);
      delete currentField[value.failedFieldName];
    } else {
      delete links[value.failedFieldName];
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
          `must have required property '${value.failedFieldName}'`,
          400,
          value.failedFieldName
        ),
      ])
    );
  },
});
