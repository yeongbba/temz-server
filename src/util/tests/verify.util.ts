import { faker } from '@faker-js/faker';

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
