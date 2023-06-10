import Mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import {
  filterFields,
  formatTest,
  itemCountTest,
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
          headSpec: faker.random.alpha(5),
          loftAngle: parseInt(faker.random.numeric(2)),
          headVolume: parseInt(faker.random.numeric(2)),
          headImport: faker.random.alpha(5),
          shaftSpec: faker.random.alpha(5),
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

export const equipmentTypeTest = () => {
  const fakeNumber = parseInt(faker.random.numeric(5));
  const fakeString = faker.random.alpha(10);
  return typeTest([
    {
      failedFieldName: 'equipmentId',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      failedFieldName: 'equipment',
      fakeValue: fakeString,
      type: 'array',
    },
    {
      failedFieldName: 'equipment',
      fakeValue: fakeString,
      type: 'object',
      item: true,
    },
    {
      parentFieldName: 'equipment',
      failedFieldName: 'list',
      fakeValue: fakeNumber,
      type: 'array',
    },
    {
      parentFieldName: 'equipment',
      failedFieldName: 'list',
      fakeValue: fakeNumber,
      type: 'object',
      item: true,
    },
    {
      parentFieldName: 'equipment',
      failedFieldName: 'type',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'brand',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'model',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'sex',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'hand',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'year',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'length',
      fakeValue: fakeString,
      type: 'integer',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'cover',
      fakeValue: fakeString,
      type: 'boolean',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'purchaseInfo',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'headSpec',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'loftAngle',
      fakeValue: fakeString,
      type: 'number',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'headVolume',
      fakeValue: fakeString,
      type: 'number',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'headImport',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'shaftSpec',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'stiffness',
      fakeValue: fakeString,
      type: 'number',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'weight',
      fakeValue: fakeString,
      type: 'number',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'torque',
      fakeValue: fakeString,
      type: 'number',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'shaftImport',
      fakeValue: fakeNumber,
      type: 'string',
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'flex',
      fakeValue: fakeString,
      type: 'number',
    },
  ]);
};

export const equipmentFormatTest = () => {
  return formatTest([
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'images',
      fakeValue: faker.random.alpha(10),
      format: 'url',
      item: true,
    },
  ]);
};

export const equipmentMissingTest = (selectedFields?: SelectedField[]) => {
  const fields: MissingValue[] = [
    { failedFieldName: 'equipmentId' },
    { failedFieldName: 'equipment' },
    { parentFieldName: 'equipment', failedFieldName: 'list' },
    { parentFieldName: 'equipment', failedFieldName: 'type' },
    { parentFieldName: 'equipment.list', failedFieldName: 'brand' },
    { parentFieldName: 'equipment.list', failedFieldName: 'model' },
    { parentFieldName: 'equipment.list', failedFieldName: 'sex' },
    { parentFieldName: 'equipment.list', failedFieldName: 'hand' },
    { parentFieldName: 'equipment.list', failedFieldName: 'year' },
    { parentFieldName: 'equipment.list', failedFieldName: 'length' },
    { parentFieldName: 'equipment.list', failedFieldName: 'cover' },
    { parentFieldName: 'equipment.list', failedFieldName: 'purchaseInfo' },
    { parentFieldName: 'equipment.list', failedFieldName: 'headSpec' },
    { parentFieldName: 'equipment.list', failedFieldName: 'loftAngle' },
    { parentFieldName: 'equipment.list', failedFieldName: 'headVolume' },
    { parentFieldName: 'equipment.list', failedFieldName: 'headImport' },
    { parentFieldName: 'equipment.list', failedFieldName: 'shaftSpec' },
    { parentFieldName: 'equipment.list', failedFieldName: 'stiffness' },
    { parentFieldName: 'equipment.list', failedFieldName: 'weight' },
    { parentFieldName: 'equipment.list', failedFieldName: 'torque' },
    { parentFieldName: 'equipment.list', failedFieldName: 'shaftImport' },
    { parentFieldName: 'equipment.list', failedFieldName: 'flex' },
  ];

  const value = filterFields<MissingValue>(fields, selectedFields);
  return missingTest(value);
};

export const equipmentMinLengthTest = () => {
  return minLengthTest([
    {
      failedFieldName: 'equipmentId',
      fakeValue: faker.random.alphaNumeric(23),
      minLength: 24,
    },
  ]);
};

export const equipmentMaxLengthTest = (selectedFields?: SelectedField[]) => {
  const fields: MaxLengthValue[] = [
    {
      failedFieldName: 'equipmentId',
      fakeValue: faker.random.alphaNumeric(25),
      maxLength: 24,
    },
    {
      parentFieldName: 'equipment',
      failedFieldName: 'type',
      fakeValue: faker.random.alphaNumeric(51),
      maxLength: 50,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'brand',
      fakeValue: faker.random.alphaNumeric(51),
      maxLength: 50,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'model',
      fakeValue: faker.random.alphaNumeric(51),
      maxLength: 50,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'sex',
      fakeValue: faker.random.alphaNumeric(2),
      maxLength: 1,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'hand',
      fakeValue: faker.random.alphaNumeric(2),
      maxLength: 1,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'year',
      fakeValue: faker.random.alphaNumeric(5),
      maxLength: 4,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'purchaseInfo',
      fakeValue: faker.random.alphaNumeric(2001),
      maxLength: 2000,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'headSpec',
      fakeValue: faker.random.alphaNumeric(51),
      maxLength: 50,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'headImport',
      fakeValue: faker.random.alphaNumeric(51),
      maxLength: 50,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'shaftSpec',
      fakeValue: faker.random.alphaNumeric(51),
      maxLength: 50,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'shaftImport',
      fakeValue: faker.random.alphaNumeric(51),
      maxLength: 50,
    },
  ];

  const value = filterFields<MaxLengthValue>(fields, selectedFields);

  return maxLengthTest(value);
};

export const equipmentMaximumTest = () => {
  return maximumTest([
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'length',
      fakeValue: parseInt(faker.random.numeric(5)),
      maximum: 1000,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'loftAngle',
      fakeValue: parseInt(faker.random.numeric(4)),
      maximum: 360,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'headVolume',
      fakeValue: parseInt(faker.random.numeric(5)),
      maximum: 1000,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'stiffness',
      fakeValue: parseInt(faker.random.numeric(5)),
      maximum: 1000,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'weight',
      fakeValue: parseInt(faker.random.numeric(5)),
      maximum: 1000,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'torque',
      fakeValue: parseInt(faker.random.numeric(5)),
      maximum: 1000,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'flex',
      fakeValue: parseInt(faker.random.numeric(5)),
      maximum: 1000,
    },
  ]);
};

export const equipmentMinimumTest = () => {
  return minimumTest([
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'length',
      fakeValue: -1,
      minimum: 0,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'loftAngle',
      fakeValue: -1,
      minimum: 0,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'headVolume',
      fakeValue: -1,
      minimum: 0,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'stiffness',
      fakeValue: -1,
      minimum: 0,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'weight',
      fakeValue: -1,
      minimum: 0,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'torque',
      fakeValue: -1,
      minimum: 0,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'flex',
      fakeValue: -1,
      minimum: 0,
    },
  ]);
};

export const equipmentItemCountTest = () => {
  return itemCountTest([
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'images',
      maxItems: 5,
    },
  ]);
};
