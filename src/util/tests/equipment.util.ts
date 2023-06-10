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
  userName: faker.string.alpha(5),
  userImage: faker.internet.url(),
  equipment: [
    {
      type: faker.lorem.word(5),
      list: [
        {
          brand: faker.lorem.word(5),
          model: faker.lorem.word(5),
          sex: 'M',
          hand: 'R',
          year: faker.string.numeric(4),
          length: parseInt(faker.string.numeric(3)),
          cover: true,
          purchaseInfo: faker.lorem.words(),
          headSpec: faker.string.alpha(5),
          loftAngle: parseInt(faker.string.numeric(2)),
          headVolume: parseInt(faker.string.numeric(2)),
          headImport: faker.string.alpha(5),
          shaftSpec: faker.string.alpha(5),
          stiffness: parseInt(faker.string.numeric(3)),
          flex: parseInt(faker.string.numeric(3)),
          weight: parseInt(faker.string.numeric(2)),
          torque: parseInt(faker.string.numeric(1)),
          shaftImport: faker.lorem.word(5),
          images: [faker.internet.url(), faker.internet.url()],
        },
      ],
    },
  ],
});

export const equipmentTypeTest = () => {
  const fakeNumber = parseInt(faker.string.numeric(5));
  const fakeString = faker.string.alpha(10);
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
      fakeValue: faker.string.alpha(10),
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
      fakeValue: faker.string.alphanumeric(23),
      minLength: 24,
    },
  ]);
};

export const equipmentMaxLengthTest = (selectedFields?: SelectedField[]) => {
  const fields: MaxLengthValue[] = [
    {
      failedFieldName: 'equipmentId',
      fakeValue: faker.string.alphanumeric(25),
      maxLength: 24,
    },
    {
      parentFieldName: 'equipment',
      failedFieldName: 'type',
      fakeValue: faker.string.alphanumeric(51),
      maxLength: 50,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'brand',
      fakeValue: faker.string.alphanumeric(51),
      maxLength: 50,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'model',
      fakeValue: faker.string.alphanumeric(51),
      maxLength: 50,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'sex',
      fakeValue: faker.string.alphanumeric(2),
      maxLength: 1,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'hand',
      fakeValue: faker.string.alphanumeric(2),
      maxLength: 1,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'year',
      fakeValue: faker.string.alphanumeric(5),
      maxLength: 4,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'purchaseInfo',
      fakeValue: faker.string.alphanumeric(2001),
      maxLength: 2000,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'headSpec',
      fakeValue: faker.string.alphanumeric(51),
      maxLength: 50,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'headImport',
      fakeValue: faker.string.alphanumeric(51),
      maxLength: 50,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'shaftSpec',
      fakeValue: faker.string.alphanumeric(51),
      maxLength: 50,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'shaftImport',
      fakeValue: faker.string.alphanumeric(51),
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
      fakeValue: parseInt(faker.string.numeric(5)),
      maximum: 1000,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'loftAngle',
      fakeValue: parseInt(faker.string.numeric(4)),
      maximum: 360,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'headVolume',
      fakeValue: parseInt(faker.string.numeric(5)),
      maximum: 1000,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'stiffness',
      fakeValue: parseInt(faker.string.numeric(5)),
      maximum: 1000,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'weight',
      fakeValue: parseInt(faker.string.numeric(5)),
      maximum: 1000,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'torque',
      fakeValue: parseInt(faker.string.numeric(5)),
      maximum: 1000,
    },
    {
      parentFieldName: 'equipment.list',
      failedFieldName: 'flex',
      fakeValue: parseInt(faker.string.numeric(5)),
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
