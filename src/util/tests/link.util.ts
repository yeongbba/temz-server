import { faker } from '@faker-js/faker';
import { formatTest, itemCountTest, maxLengthTest, missingTest, typeTest } from './common.util';

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

export const linkItemCountTest = () => {
  return itemCountTest([
    {
      parentFieldName: 'links',
      failedFieldName: 'general',
      maxItems: 5,
    },
    {
      parentFieldName: 'links.general',
      failedFieldName: 'links',
      maxItems: 9,
    },
  ]);
};

export const linkTypeTest = () => {
  const fakeNumber = parseInt(faker.random.numeric(5));
  const fakeString = faker.random.word();
  return typeTest([
    {
      failedFieldName: 'links',
      fakeValue: fakeString,
      type: 'object',
    },
    {
      parentFieldName: 'links',
      failedFieldName: 'youtube',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'links',
      failedFieldName: 'twitter',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'links',
      failedFieldName: 'tiktok',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'links',
      failedFieldName: 'instagram',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'links',
      failedFieldName: 'facebook',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'links',
      failedFieldName: 'telegram',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'links',
      failedFieldName: 'general',
      fakeValue: fakeString,
      type: 'array',
    },
    {
      parentFieldName: 'links',
      failedFieldName: 'general',
      fakeValue: fakeString,
      type: 'object',
      item: true,
    },
    {
      parentFieldName: 'links.general',
      failedFieldName: 'title',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'links.general',
      failedFieldName: 'links',
      fakeValue: fakeString,
      type: 'array',
    },
    {
      parentFieldName: 'links.general',
      failedFieldName: 'links',
      fakeValue: fakeString,
      type: 'object',
      item: true,
    },
    {
      parentFieldName: 'links.general.links',
      failedFieldName: 'description',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'links.general.links',
      failedFieldName: 'link',
      fakeValue: fakeNumber,
      type: 'string',
    },
  ]);
};

export const linkMaxLengthTest = () => {
  return maxLengthTest([
    {
      parentFieldName: 'links.general',
      failedFieldName: 'title',
      fakeValue: faker.random.alpha({ count: 51 }),
      maxLength: 50,
    },
    {
      parentFieldName: 'links.general.links',
      failedFieldName: 'description',
      fakeValue: faker.random.alpha({ count: 51 }),
      maxLength: 50,
    },
  ]);
};

export const linkFormatTest = () => {
  return formatTest([
    { parentFieldName: 'links', failedFieldName: 'youtube', fakeValue: faker.random.alpha(10), format: 'url' },
    { parentFieldName: 'links', failedFieldName: 'twitter', fakeValue: faker.random.alpha(10), format: 'url' },
    { parentFieldName: 'links', failedFieldName: 'tiktok', fakeValue: faker.random.alpha(10), format: 'url' },
    { parentFieldName: 'links', failedFieldName: 'instagram', fakeValue: faker.random.alpha(10), format: 'url' },
    { parentFieldName: 'links', failedFieldName: 'facebook', fakeValue: faker.random.alpha(10), format: 'url' },
    { parentFieldName: 'links', failedFieldName: 'telegram', fakeValue: faker.random.alpha(10), format: 'url' },
    {
      parentFieldName: 'links.general.links',
      failedFieldName: 'link',
      fakeValue: faker.random.alpha(10),
      format: 'url',
    },
  ]);
};

export const linkMissingTest = () => {
  return missingTest([
    { failedFieldName: 'links' },
    { parentFieldName: 'links', failedFieldName: 'general' },
    { parentFieldName: 'links.general', failedFieldName: 'title' },
    { parentFieldName: 'links.general', failedFieldName: 'links' },
    { parentFieldName: 'links.general.links', failedFieldName: 'description' },
    { parentFieldName: 'links.general.links', failedFieldName: 'link' },
  ]);
};
