import { faker } from '@faker-js/faker';

export const fakeUser = (useId: boolean = true) => ({
  id: useId ? 1 : undefined,
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
