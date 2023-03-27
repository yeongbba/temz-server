import { faker } from '@faker-js/faker';
import { AxiosInstance } from 'axios';

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
