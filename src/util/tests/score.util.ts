import Mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import {
  filterFields,
  formatTest,
  maximumTest,
  maxLengthTest,
  minimumTest,
  minLengthTest,
  missingTest,
  typeTest,
} from './common.util';
import { MaxLengthValue, MissingValue, SelectedField } from '../../types/common';
import { formatDate } from '../common.util';

export const fakeScore = (useId: boolean = true) => ({
  id: useId ? new Mongoose.Types.ObjectId().toString() : undefined,
  course: faker.lorem.word(5),
  date: formatDate(faker.date.past({ years: 3 })),
  firstHalfScore: parseInt(faker.string.numeric(2)),
  secondHalfScore: parseInt(faker.string.numeric(2)),
  image: faker.internet.url(),
});

export const scoreTypeTest = () => {
  const fakeNumber = parseInt(faker.string.numeric(5));
  const fakeString = faker.string.alpha(10);
  return typeTest([
    {
      failedFieldName: 'scoreId',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      failedFieldName: 'course',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      failedFieldName: 'date',
      fakeValue: fakeNumber,
      type: 'string',
      format: 'date',
    },
    {
      failedFieldName: 'firstHalfScore',
      fakeValue: fakeString,
      type: 'integer',
    },
    {
      failedFieldName: 'secondHalfScore',
      fakeValue: fakeString,
      type: 'integer',
    },
    {
      failedFieldName: 'image',
      fakeValue: fakeNumber,
      type: 'string',
    },
  ]);
};

export const scoreFormatTest = () => {
  return formatTest([
    { failedFieldName: 'date', fakeValue: faker.string.alpha(10), format: 'date' },
    { failedFieldName: 'image', fakeValue: faker.string.alpha(10), format: 'url' },
  ]);
};

export const scoreMissingTest = (selectedFields?: SelectedField[]) => {
  const fields: MissingValue[] = [
    { failedFieldName: 'scoreId' },
    { failedFieldName: 'course' },
    { failedFieldName: 'date' },
    { failedFieldName: 'firstHalfScore' },
    { failedFieldName: 'secondHalfScore' },
    { failedFieldName: 'image' },
  ];

  const value = filterFields<MissingValue>(fields, selectedFields);
  return missingTest(value);
};

export const scoreMinLengthTest = () => {
  return minLengthTest([
    {
      failedFieldName: 'scoreId',
      fakeValue: faker.string.alphanumeric(23),
      minLength: 24,
    },
  ]);
};

export const scoreMaxLengthTest = (selectedFields?: SelectedField[]) => {
  const fields: MaxLengthValue[] = [
    {
      failedFieldName: 'scoreId',
      fakeValue: faker.string.alphanumeric(25),
      maxLength: 24,
    },
    {
      failedFieldName: 'course',
      fakeValue: faker.string.alphanumeric(31),
      maxLength: 30,
    },
  ];

  const value = filterFields<MaxLengthValue>(fields, selectedFields);

  return maxLengthTest(value);
};

export const scoreMaximumTest = () => {
  return maximumTest([
    {
      failedFieldName: 'firstHalfScore',
      fakeValue: parseInt(faker.string.numeric(4)),
      maximum: 300,
    },
    {
      failedFieldName: 'secondHalfScore',
      fakeValue: parseInt(faker.string.numeric(4)),
      maximum: 300,
    },
  ]);
};

export const scoreMinimumTest = () => {
  return minimumTest([
    {
      failedFieldName: 'firstHalfScore',
      fakeValue: -1,
      minimum: 0,
    },
    {
      failedFieldName: 'secondHalfScore',
      fakeValue: -1,
      minimum: 0,
    },
  ]);
};
