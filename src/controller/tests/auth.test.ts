import httpMocks from 'node-mocks-http';
import bcrypt from 'bcrypt';
import { AuthController } from '../auth';
import { faker } from '@faker-js/faker';
import { User } from '../../types/auth';
import { FailureObject } from '../../util/error.util';
import { ErrorCode } from '../../types/error.util';
import { config } from '../../../config';

jest.mock('bcrypt');

describe('Auth Controller', () => {
  let authController: AuthController;
  let userRepository: any;

  beforeEach(() => {
    userRepository = {};
    authController = new AuthController(userRepository);
  });

  describe('signup', () => {
    let user: User;
    let oldUser: User;
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/auth/signup',
    });
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const name = faker.internet.userName();
      user = {
        name,
        password: faker.internet.password(),
        phone: faker.phone.number('010########'),
        email: faker.internet.email(),
        profile: {
          title: name,
          description: faker.random.words(3),
          image: faker.internet.avatar(),
          background: faker.internet.avatar(),
        },
        wallet: `0x${faker.random.numeric(40)}`,
      };
      oldUser = User.parse({ userId: 1, ...user });

      request = httpMocks.createRequest({
        method: 'POST',
        url: '/auth/signup',
        body: user,
      });
      response = httpMocks.createResponse();
    });

    it('returns 409 for the request if user has already signed up', async () => {
      userRepository.findByName = jest.fn(() => oldUser);
      const signup = async () => authController.signup(request, response);

      await expect(signup()).rejects.toThrow(
        new FailureObject(ErrorCode.DUPLICATED_VALUE, `${user.name} already exists`, 409)
      );
      expect(userRepository.findByName).toHaveBeenCalledWith(user.name);
    });

    it('If there is a user with the same phone number, update the phone number to null.', async () => {
      userRepository.findByName = jest.fn();
      userRepository.findByPhone = jest.fn(() => oldUser);
      userRepository.updateUser = jest.fn();
      userRepository.createUser = jest.fn();

      await authController.signup(request, response);
      expect(userRepository.findByPhone).toHaveBeenCalledWith(user.phone);
      expect(oldUser.phone).toBeNull();
      expect(userRepository.updateUser).toHaveBeenCalledWith(oldUser.userId, oldUser);
    });

    it('returns 201 with created tweet object including userId', async () => {
      userRepository.findByName = jest.fn();
      userRepository.findByPhone = jest.fn();
      userRepository.updateUser = jest.fn();
      userRepository.createUser = jest.fn();

      const hashed = faker.random.alphaNumeric(60);
      bcrypt.hash = jest.fn(async () => hashed);
      const data = User.parse({
        ...user,
        password: hashed,
      });
      await authController.signup(request, response);

      expect(bcrypt.hash).toHaveBeenCalledWith(user.password, config.bcrypt.saltRounds);
      expect(userRepository.createUser).toHaveBeenCalledWith(data);
      expect(response.statusCode).toBe(201);
    });
  });

  // it('returns 401 for the request with unsupported Authorization header', async () => {
  //   const request = httpMocks.createRequest({
  //     method: 'GET',
  //     url: '/tweets',
  //     headers: { Authorization: 'Basic' },
  //   });
  //   const response = httpMocks.createResponse();
  //   const next = jest.fn();
  //   await isAuth(request, response, next);
  //   expect(response.statusCode).toBe(401);
  //   expect(response._getJSONData().message).toBe('Authentication Error');
  //   expect(next).not.toBeCalled();
  // });
  // it('returns 401 for the request with invalid JWT', async () => {
  //   const token = faker.random.alphaNumeric(128);
  //   const request = httpMocks.createRequest({
  //     method: 'GET',
  //     url: '/tweets',
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //   const response = httpMocks.createResponse();
  //   const next = jest.fn();
  //   setValueToOnlyReadProp(
  //     jwt,
  //     'verify',
  //     jest.fn((token, secret, callback) => {
  //       callback(new Error('bad token'), undefined);
  //     })
  //   );
  //   await isAuth(request, response, next);
  //   expect(response.statusCode).toBe(401);
  //   expect(response._getJSONData().message).toBe('Authentication Error');
  //   expect(next).not.toBeCalled();
  // });
  // it('returns 401 when cannot find a user by id from the JWT', async () => {
  //   const token = faker.random.alphaNumeric(128);
  //   const userId = faker.random.alphaNumeric(32);
  //   const request = httpMocks.createRequest({
  //     method: 'GET',
  //     url: '/tweets',
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //   const response = httpMocks.createResponse();
  //   const next = jest.fn();
  //   setValueToOnlyReadProp(
  //     jwt,
  //     'verify',
  //     jest.fn((token, secret, callback) => {
  //       callback(undefined, { id: userId });
  //     })
  //   );
  //   setValueToOnlyReadProp(
  //     userRepository,
  //     'findById',
  //     jest.fn(() => Promise.resolve(undefined))
  //   );
  //   await isAuth(request, response, next);
  //   expect(response.statusCode).toBe(401);
  //   expect(response._getJSONData().message).toBe('Authentication Error');
  //   expect(next).not.toBeCalled();
  // });
  // it('passes a request with valid Authorization header with token', async () => {
  //   const token = faker.random.alphaNumeric(128);
  //   const userId = faker.random.alphaNumeric(32);
  //   const request = httpMocks.createRequest({
  //     method: 'GET',
  //     url: '/tweets',
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //   const response = httpMocks.createResponse();
  //   const next = jest.fn();
  //   setValueToOnlyReadProp(
  //     jwt,
  //     'verify',
  //     jest.fn((token, secret, callback) => {
  //       callback(undefined, { id: userId });
  //     })
  //   );
  //   setValueToOnlyReadProp(
  //     userRepository,
  //     'findById',
  //     jest.fn((id) => Promise.resolve({ id }))
  //   );
  //   await isAuth(request, response, next);
  //   expect(request).toMatchObject({ userId, token });
  //   expect(next).toHaveBeenCalledTimes(1);
  // });
});
