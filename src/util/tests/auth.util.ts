import { faker } from '@faker-js/faker';
import { AxiosInstance } from 'axios';
import {
  filterFields,
  formatTest,
  maxLengthTest,
  minLengthTest,
  missingTest,
  patternTest,
  typeTest,
} from './common.util';
import { MaxLengthValue, MinLengthValue, MissingValue, PatternValue, TypeValue } from '../../types/common';

export const DATE_REGEX = /[1-9]\d{3}-(0[1-9]|1[0-2])-(3[0-1]|[1-2]\d|0[1-9])T(0\d|1\d|2[0-3])(:[0-5]\d){2}.\d{3}Z/;

export const fakeUser = (useId: boolean = true) => ({
  id: useId ? faker.random.alphaNumeric(24) : undefined,
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

export const authMaxLengthTest = (selectedFields?: { parentFieldName?: string; failedFieldName: string }[]) => {
  const fields: MaxLengthValue[] = [
    { failedFieldName: 'name', fakeValue: faker.random.alpha({ count: 26 }), maxLength: 25 },
    { failedFieldName: 'wallet', fakeValue: faker.random.alphaNumeric(43), maxLength: 42 },
    { parentFieldName: 'profile', failedFieldName: 'title', fakeValue: faker.random.alpha(26), maxLength: 25 },
    {
      parentFieldName: 'profile',
      failedFieldName: 'description',
      fakeValue: faker.random.alpha(501),
      maxLength: 500,
    },
  ];

  const value = filterFields<MaxLengthValue>(fields, selectedFields);

  return maxLengthTest(value);
};

export const authMinLengthTest = (selectedFields?: { parentFieldName?: string; failedFieldName: string }[]) => {
  const fields: MinLengthValue[] = [
    { failedFieldName: 'name', fakeValue: faker.random.alpha({ count: 2 }), minLength: 3 },
    { failedFieldName: 'wallet', fakeValue: faker.random.alphaNumeric(24), minLength: 25 },
  ];

  const value = filterFields<MinLengthValue>(fields, selectedFields);

  return minLengthTest(value);
};

export const authMissingTest = (selectedFields?: { parentFieldName?: string; failedFieldName: string }[]) => {
  const fields: MissingValue[] = [
    { failedFieldName: 'name' },
    { failedFieldName: 'phone' },
    { failedFieldName: 'profile' },
    { parentFieldName: 'profile', failedFieldName: 'title' },
    { failedFieldName: 'password' },
  ];

  const value = filterFields<MissingValue>(fields, selectedFields);

  return missingTest(value);
};

export const authFormatTest = () =>
  formatTest([
    { failedFieldName: 'email', fakeValue: faker.random.alpha(10), format: 'email' },
    { parentFieldName: 'profile', failedFieldName: 'image', fakeValue: faker.random.alpha(10), format: 'url' },
    { parentFieldName: 'profile', failedFieldName: 'background', fakeValue: faker.random.alpha(26), format: 'url' },
  ]);

export const authPatternTest = (selectedFields?: { parentFieldName?: string; failedFieldName: string }[]) => {
  const fields: PatternValue[] = [
    {
      failedFieldName: 'phone',
      fakeValue: faker.phone.number('011########'),
      pattern: '^(010)(\\d{4})(\\d{4})$',
    },
    {
      failedFieldName: 'password',
      fakeValue: faker.random.alphaNumeric(10),
      pattern: '(?=.*[0-9])(?=.*[a-z])(?=.*\\W)(?=\\S+$).{8,20}',
    },
  ];

  const value = filterFields<PatternValue>(fields, selectedFields);

  return patternTest(value);
};

export const authTypeTest = (selectedFields?: { parentFieldName?: string; failedFieldName: string }[]) => {
  const fakeNumber = parseInt(faker.random.numeric(5));
  const fakeString = faker.random.word();

  const fields: TypeValue[] = [
    {
      failedFieldName: 'name',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      failedFieldName: 'password',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      failedFieldName: 'phone',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      failedFieldName: 'email',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      failedFieldName: 'wallet',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      failedFieldName: 'profile',
      fakeValue: fakeString,
      type: 'object',
    },
    {
      parentFieldName: 'profile',
      failedFieldName: 'title',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'profile',
      failedFieldName: 'description',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'profile',
      failedFieldName: 'image',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'profile',
      failedFieldName: 'background',
      fakeValue: fakeNumber,
      type: 'string',
    },
  ];

  const value = filterFields<TypeValue>(fields, selectedFields);

  return typeTest(value);
};
