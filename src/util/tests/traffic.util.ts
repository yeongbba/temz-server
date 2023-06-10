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

export const fakeTraffic = (useId: boolean = true) => ({
  id: useId ? new Mongoose.Types.ObjectId().toString() : undefined,
  view: parseInt(faker.string.numeric(2)),
  date: formatDate(faker.date.past(3)),
});

export const fakeTotalTraffic = (useId: boolean = true) => ({
  id: useId ? new Mongoose.Types.ObjectId().toString() : undefined,
  total: parseInt(faker.string.numeric(2)),
});

export const trafficTypeTest = () => {
  const fakeNumber = parseInt(faker.string.numeric(5));
  const fakeString = faker.string.alpha(10);
  return typeTest([
    {
      failedFieldName: 'trafficId',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      failedFieldName: 'date',
      fakeValue: fakeNumber,
      type: 'string',
      format: 'date',
      nullable: true,
    },
    {
      failedFieldName: 'view',
      fakeValue: fakeString,
      type: 'integer',
    },
  ]);
};

export const trafficFormatTest = () => {
  return formatTest([{ failedFieldName: 'date', fakeValue: faker.string.alpha(10), format: 'date' }]);
};

export const trafficMissingTest = (selectedFields?: SelectedField[]) => {
  const fields: MissingValue[] = [
    { failedFieldName: 'trafficId' },
    { failedFieldName: 'view' },
    { failedFieldName: 'date' },
  ];

  const value = filterFields<MissingValue>(fields, selectedFields);
  return missingTest(value);
};

export const trafficMinLengthTest = () => {
  return minLengthTest([
    {
      failedFieldName: 'trafficId',
      fakeValue: faker.string.alphanumeric(23),
      minLength: 24,
    },
  ]);
};

export const trafficMaxLengthTest = (selectedFields?: SelectedField[]) => {
  const fields: MaxLengthValue[] = [
    {
      failedFieldName: 'trafficId',
      fakeValue: faker.string.alphanumeric(25),
      maxLength: 24,
    },
  ];

  const value = filterFields<MaxLengthValue>(fields, selectedFields);

  return maxLengthTest(value);
};

export const trafficMinimumTest = () => {
  return minimumTest([
    {
      failedFieldName: 'view',
      fakeValue: -1,
      minimum: 0,
    },
  ]);
};
