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

export const fakeEquipment = (useId: boolean = true) => ({
  id: useId ? new Mongoose.Types.ObjectId().toString() : undefined,
  userName: faker.random.alpha(5),
  userImage: faker.internet.url(),
  equipment: [
    {
      type: faker.random.word(),
      list: [
        {
          brand: faker.random.word(),
          model: faker.random.word(),
          sex: 'M',
          hand: 'R',
          year: faker.random.numeric(4),
          length: parseInt(faker.random.numeric(3)),
          cover: true,
          purchaseInfo: faker.random.words(),
          headSpec: '헤드 스펙',
          loftAngle: parseInt(faker.random.numeric(2)),
          headVolume: parseInt(faker.random.numeric(2)),
          headImport: '골프존',
          shaftSpec: parseInt(faker.random.numeric(3)),
          stiffness: parseInt(faker.random.numeric(3)),
          flex: parseInt(faker.random.numeric(3)),
          weight: parseInt(faker.random.numeric(2)),
          torque: parseInt(faker.random.numeric(1)),
          shaftImport: faker.random.word(),
          images: [faker.internet.url(), faker.internet.url()],
        },
      ],
    },
  ],
});

export const scoreTypeTest = () => {
  const fakeNumber = parseInt(faker.random.numeric(5));
  const fakeString = faker.random.alpha(10);
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
    { failedFieldName: 'date', fakeValue: faker.random.alpha(10), format: 'date' },
    { failedFieldName: 'image', fakeValue: faker.random.alpha(10), format: 'url' },
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
      fakeValue: faker.random.alphaNumeric(23),
      minLength: 24,
    },
  ]);
};

export const scoreMaxLengthTest = (selectedFields?: SelectedField[]) => {
  const fields: MaxLengthValue[] = [
    {
      failedFieldName: 'scoreId',
      fakeValue: faker.random.alphaNumeric(25),
      maxLength: 24,
    },
    {
      failedFieldName: 'course',
      fakeValue: faker.random.alphaNumeric(31),
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
      fakeValue: parseInt(faker.random.numeric(4)),
      maximum: 300,
    },
    {
      failedFieldName: 'secondHalfScore',
      fakeValue: parseInt(faker.random.numeric(4)),
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
