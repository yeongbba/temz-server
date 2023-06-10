import Mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { maxLengthTest, minLengthTest, missingTest, typeTest } from './common.util';

export const fakeBookmark = (useId: boolean = true) => ({
  id: useId ? new Mongoose.Types.ObjectId().toString() : undefined,
  userId: new Mongoose.Types.ObjectId().toString(),
  userName: faker.lorem.word(5),
  userImage: faker.internet.url(),
  followerId: new Mongoose.Types.ObjectId().toString(),
  followerName: faker.lorem.word(5),
  followerImage: faker.internet.url(),
  followingId: new Mongoose.Types.ObjectId().toString(),
  followingName: faker.lorem.word(5),
  followingImage: faker.internet.url(),
});

export const bookmarkTypeTest = () => {
  const fakeNumber = parseInt(faker.string.numeric(5));
  return typeTest([
    {
      failedFieldName: 'followingName',
      fakeValue: fakeNumber,
      type: 'string',
    },
  ]);
};

export const bookmarkMissingTest = () => {
  return missingTest([{ failedFieldName: 'followingName' }]);
};

export const bookmarkMinLengthTest = () => {
  return minLengthTest([
    {
      failedFieldName: 'followingName',
      fakeValue: faker.string.alphanumeric(2),
      minLength: 3,
    },
  ]);
};

export const bookmarkMaxLengthTest = () => {
  return maxLengthTest([
    {
      failedFieldName: 'followingName',
      fakeValue: faker.string.alphanumeric(26),
      maxLength: 25,
    },
  ]);
};
