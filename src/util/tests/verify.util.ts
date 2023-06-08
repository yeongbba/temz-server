import { faker } from '@faker-js/faker';
import { MissingValue, SelectedField, TypeValue } from '../../types/common';
import { filterFields, maxLengthTest, minLengthTest, missingTest, patternTest, typeTest } from './common.util';

export const generatePhoneNumber = () => faker.phone.number('010########');
export class FakePhoneNumber {
  private numberSet = new Set();

  generate = () => {
    let phone: string | null = null;
    do {
      phone = faker.phone.number(`0100000####`);
    } while (this.numberSet.has(phone));
    this.numberSet.add(phone);
    return phone;
  };
}

export const verifyMissingTest = (selectedFields?: SelectedField[]) => {
  const fields: MissingValue[] = [{ failedFieldName: 'phone' }, { failedFieldName: 'code' }];

  const value = filterFields<MissingValue>(fields, selectedFields);

  return missingTest(value);
};

export const verifyTypeTest = (selectedFields?: SelectedField[]) => {
  const fakeNumber = parseInt(faker.random.numeric(5));

  const fields: TypeValue[] = [
    { failedFieldName: 'phone', fakeValue: fakeNumber, type: 'string' },
    { failedFieldName: 'code', fakeValue: fakeNumber, type: 'string' },
  ];

  const value = filterFields<TypeValue>(fields, selectedFields);

  return typeTest(value);
};

export const verifyMinLengthTest = () =>
  minLengthTest([{ failedFieldName: 'code', fakeValue: faker.random.alpha({ count: 5 }), minLength: 6 }]);

export const verifyMaxLengthTest = () =>
  maxLengthTest([{ failedFieldName: 'code', fakeValue: faker.random.alpha({ count: 7 }), maxLength: 6 }]);

export const verifyPatternTest = () =>
  patternTest([
    {
      failedFieldName: 'phone',
      fakeValue: faker.phone.number('011########'),
      pattern: '^(010)(\\d{4})(\\d{4})$',
    },
  ]);
