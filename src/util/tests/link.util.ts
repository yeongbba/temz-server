import Mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import {
  filterFields,
  formatTest,
  itemCountTest,
  maxLengthTest,
  minLengthTest,
  minimumTest,
  missingTest,
  typeTest,
} from './common.util';
import { MaxLengthValue, MissingValue, SelectedField } from '../../types/common';

export const fakeSocialLinks = (useId: boolean = true) => ({
  id: useId ? new Mongoose.Types.ObjectId().toString() : undefined,
  youtube: faker.internet.url(),
  twitter: faker.internet.url(),
  tiktok: faker.internet.url(),
  instagram: faker.internet.url(),
  facebook: faker.internet.url(),
  telegram: faker.internet.url(),
});

export const fakeGeneralLinks = (useId: boolean = true) => ({
  id: useId ? new Mongoose.Types.ObjectId().toString() : undefined,
  title: faker.random.alpha(10),
  links: [
    {
      description: faker.random.alpha(10),
      link: faker.internet.url(),
      viewCount: parseInt(faker.random.numeric(1)),
    },
  ],
});

export const socialLinkTypeTest = () => {
  const fakeNumber = parseInt(faker.random.numeric(5));
  return typeTest([
    {
      failedFieldName: 'linkId',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      failedFieldName: 'youtube',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      failedFieldName: 'twitter',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      failedFieldName: 'tiktok',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      failedFieldName: 'instagram',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      failedFieldName: 'facebook',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      failedFieldName: 'telegram',
      fakeValue: fakeNumber,
      type: 'string',
    },
  ]);
};

export const socialLinkFormatTest = () => {
  return formatTest([
    { failedFieldName: 'youtube', fakeValue: faker.random.alpha(10), format: 'url' },
    { failedFieldName: 'twitter', fakeValue: faker.random.alpha(10), format: 'url' },
    { failedFieldName: 'tiktok', fakeValue: faker.random.alpha(10), format: 'url' },
    { failedFieldName: 'instagram', fakeValue: faker.random.alpha(10), format: 'url' },
    { failedFieldName: 'facebook', fakeValue: faker.random.alpha(10), format: 'url' },
    { failedFieldName: 'telegram', fakeValue: faker.random.alpha(10), format: 'url' },
  ]);
};

export const socialLinkMissingTest = () => {
  return missingTest([
    { failedFieldName: 'linkId' },
    { failedFieldName: 'youtube' },
    { failedFieldName: 'twitter' },
    { failedFieldName: 'tiktok' },
    { failedFieldName: 'instagram' },
    { failedFieldName: 'facebook' },
    { failedFieldName: 'telegram' },
  ]);
};

export const socialLinkMinLengthTest = () => {
  return minLengthTest([
    {
      failedFieldName: 'linkId',
      fakeValue: faker.random.alphaNumeric(23),
      minLength: 24,
    },
  ]);
};

export const socialLinkMaxLengthTest = () => {
  return maxLengthTest([
    {
      failedFieldName: 'linkId',
      fakeValue: faker.random.alphaNumeric(25),
      maxLength: 24,
    },
  ]);
};

export const generalLinkTypeTest = () => {
  const fakeNumber = parseInt(faker.random.numeric(5));
  const fakeString = faker.random.word();
  return typeTest([
    {
      failedFieldName: 'linkId',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      failedFieldName: 'links',
      fakeValue: fakeString,
      type: 'array',
    },
    {
      failedFieldName: 'links',
      fakeValue: fakeString,
      type: 'object',
      item: true,
    },
    {
      failedFieldName: 'title',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'links',
      failedFieldName: 'description',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'links',
      failedFieldName: 'link',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'links',
      failedFieldName: 'viewCount',
      fakeValue: fakeString,
      type: 'integer',
    },
  ]);
};

export const generalLinkMinLengthTest = () => {
  return minLengthTest([
    {
      failedFieldName: 'linkId',
      fakeValue: faker.random.alphaNumeric(23),
      minLength: 24,
    },
  ]);
};

export const generalLinkMaxLengthTest = (selectedFields?: SelectedField[]) => {
  const fields: MaxLengthValue[] = [
    {
      failedFieldName: 'linkId',
      fakeValue: faker.random.alphaNumeric(25),
      maxLength: 24,
    },
    {
      failedFieldName: 'title',
      fakeValue: faker.random.alpha({ count: 51 }),
      maxLength: 50,
    },
    {
      parentFieldName: 'links',
      failedFieldName: 'description',
      fakeValue: faker.random.alpha({ count: 51 }),
      maxLength: 50,
    },
  ];

  const value = filterFields<MaxLengthValue>(fields, selectedFields);

  return maxLengthTest(value);
};

export const generalLinkFormatTest = () => {
  return formatTest([
    {
      parentFieldName: 'links',
      failedFieldName: 'link',
      fakeValue: faker.random.alpha(10),
      format: 'url',
    },
  ]);
};

export const generalLinkMissingTest = (selectedFields?: SelectedField[]) => {
  const fields: MissingValue[] = [
    { failedFieldName: 'linkId' },
    { failedFieldName: 'title' },
    { failedFieldName: 'links' },
    { parentFieldName: 'links', failedFieldName: 'description' },
    { parentFieldName: 'links', failedFieldName: 'link' },
    { parentFieldName: 'links', failedFieldName: 'viewCount' },
  ];

  const value = filterFields<MissingValue>(fields, selectedFields);
  return missingTest(value);
};

export const generalLinkItemCountTest = () => {
  return itemCountTest([
    {
      failedFieldName: 'links',
      maxItems: 9,
    },
  ]);
};

export const generalLinkMinimumTest = () => {
  return minimumTest([
    {
      parentFieldName: 'links',
      failedFieldName: 'viewCount',
      fakeValue: -1,
      minimum: 0,
    },
  ]);
};
