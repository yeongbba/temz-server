import { faker } from '@faker-js/faker';

export const fakeLinks = (useId: boolean = true) => ({
  links: {
    id: useId ? faker.random.alphaNumeric(24) : undefined,
    youtube: faker.internet.url(),
    twitter: faker.internet.url(),
    tiktok: faker.internet.url(),
    instagram: faker.internet.url(),
    facebook: faker.internet.url(),
    telegram: faker.internet.url(),
    general: [
      {
        title: faker.random.words(3),
        links: [
          {
            description: faker.random.words(5),
            link: faker.internet.url(),
          },
        ],
      },
    ],
  },
});
