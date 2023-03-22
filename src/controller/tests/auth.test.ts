import httpMocks from 'node-mocks-http';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AuthController } from '../auth';
import { faker } from '@faker-js/faker';
import { User } from '../../types/auth';
import { FailureObject } from '../../util/error.util';
import { ErrorCode } from '../../types/error.util';
import { config } from '../../../config';
import { CookieOptions } from 'express';

jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('Auth Controller', () => {
  let authController: AuthController;
  let userRepository: any;

  beforeEach(() => {
    userRepository = {};
    authController = new AuthController(userRepository);
  });

  describe('checkName', () => {
    let user: User;
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const name = faker.internet.userName();
      user = User.parse({
        id: 1,
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
      });

      request = httpMocks.createRequest({
        method: 'GET',
        url: `/auth/check-name?name=${name}`,
        query: { name },
      });
      response = httpMocks.createResponse();
    });

    it('If the name is already in use, isValid returns false.', async () => {
      userRepository.findByName = jest.fn(() => user);

      await authController.checkName(request, response);

      expect(userRepository.findByName).toHaveBeenCalledWith(request.query.name);
      expect(response._getJSONData()).toEqual({ isValid: false });
      expect(response.statusCode).toBe(200);
    });

    it('If no name is in use, isValid returns false.', async () => {
      const name = faker.internet.userName();
      request.url = `/auth/check-name?name=${name}`;
      request.query = { name };
      userRepository.findByName = jest.fn();

      await authController.checkName(request, response);

      expect(userRepository.findByName).toHaveBeenCalledWith(request.query.name);
      expect(response._getJSONData()).toEqual({ isValid: true });
      expect(response.statusCode).toBe(200);
    });
  });

  describe('me', () => {
    let me: User;
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const name = faker.internet.userName();
      const user = {
        id: 1,
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
      me = User.parse(user);

      request = httpMocks.createRequest({
        method: 'GET',
        url: `/auth/me`,
      });
      response = httpMocks.createResponse();
    });

    it('Find my information by id', async () => {
      request.userId = 1;
      userRepository.findById = jest.fn(() => me);
      await authController.me(request, response);

      expect(userRepository.findById).toHaveBeenCalledWith(request.userId);
      expect(response._getJSONData()).toEqual({ user: me });
      expect(response._getJSONData().userId).toBeUndefined();
      expect(response._getJSONData().password).toBeUndefined();
      expect(response.statusCode).toBe(200);
    });
  });

  describe('csrf', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      request = httpMocks.createRequest({
        method: 'GET',
        url: `/auth/csrf`,
      });
      response = httpMocks.createResponse();
    });

    it('Generate csrf token', async () => {
      const token = faker.random.alphaNumeric(60);
      bcrypt.hash = jest.fn(async () => token);

      await authController.csrf(request, response);

      expect(bcrypt.hash).toHaveBeenCalledWith(config.csrf.plainToken, 1);
      expect(response._getJSONData()).toEqual({ token });
      expect(response.statusCode).toBe(200);
    });
  });

  describe('signup', () => {
    let oldUser: User;
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const name = faker.internet.userName();
      const user = {
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
      oldUser = User.parse({ id: 1, ...user });

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
        new FailureObject(ErrorCode.DUPLICATED_VALUE, `${request.body.name} already exists`, 409)
      );
      expect(userRepository.findByName).toHaveBeenCalledWith(request.body.name);
    });

    it('If there is a user with the same phone number, update the phone number to null.', async () => {
      userRepository.findByName = jest.fn();
      userRepository.findByPhone = jest.fn(() => oldUser);
      userRepository.updateUser = jest.fn();
      userRepository.createUser = jest.fn();

      await authController.signup(request, response);

      expect(userRepository.findByName).toHaveBeenCalledWith(request.body.name);
      expect(userRepository.findByPhone).toHaveBeenCalledWith(request.body.phone);
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
        ...request.body,
        password: hashed,
      });
      await authController.signup(request, response);

      expect(userRepository.findByName).toHaveBeenCalledWith(request.body.name);
      expect(userRepository.findByPhone).toHaveBeenCalledWith(request.body.phone);
      expect(bcrypt.hash).toHaveBeenCalledWith(request.body.password, config.bcrypt.saltRounds);
      expect(userRepository.createUser).toHaveBeenCalledWith(data);
      expect(response.statusCode).toBe(201);
    });
  });

  describe('login', () => {
    let user: User;
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const name = faker.internet.userName();
      const password = faker.internet.password();
      user = User.parse({
        id: 1,
        name,
        password: password,
        phone: faker.phone.number('010########'),
        email: faker.internet.email(),
        profile: {
          title: name,
          description: faker.random.words(3),
          image: faker.internet.avatar(),
          background: faker.internet.avatar(),
        },
        wallet: `0x${faker.random.numeric(40)}`,
      });

      request = httpMocks.createRequest({
        method: 'POST',
        url: '/auth/login',
        body: {
          name,
          password: password,
        },
      });
      response = httpMocks.createResponse();
    });

    it('If the account tried to log in does not exist, returns 401 for the request', async () => {
      userRepository.findByName = jest.fn();
      const login = async () => authController.login(request, response);

      await expect(login()).rejects.toThrow(
        new FailureObject(ErrorCode.INVALID_VALUE, 'Invalid user or password', 401)
      );
      expect(userRepository.findByName).toHaveBeenCalledWith(request.body.name);
    });

    it('If the password does not match, returns 401 for the request', async () => {
      userRepository.findByName = jest.fn(() => user);
      bcrypt.compare = jest.fn(async () => false);
      const login = async () => authController.login(request, response);

      await expect(login()).rejects.toThrow(
        new FailureObject(ErrorCode.INVALID_VALUE, 'Invalid user or password', 401)
      );
      expect(userRepository.findByName).toHaveBeenCalledWith(request.body.name);
      expect(bcrypt.compare).toHaveBeenCalledWith(request.body.password, user.password);
    });

    it('If the phone number does not exist, returns 404 for the request', async () => {
      userRepository.findByName = jest.fn(() => {
        user.phone = null;
        return user;
      });
      bcrypt.compare = jest.fn(async () => true);
      const login = async () => authController.login(request, response);

      await expect(login()).rejects.toThrow(new FailureObject(ErrorCode.NOT_FOUND, 'Phone number was not found', 404));
      expect(userRepository.findByName).toHaveBeenCalledWith(request.body.name);
      expect(bcrypt.compare).toHaveBeenCalledWith(request.body.password, user.password);
    });

    it('If login is successful, returns 201 for the request', async () => {
      const id = user.userId;
      const password = user.password;
      userRepository.findByName = jest.fn(() => user);
      bcrypt.compare = jest.fn(async () => true);
      const token = faker.random.alphaNumeric(189);
      jwt.sign = jest.fn(() => token);
      response.cookie = jest.fn();
      const options: CookieOptions = {
        maxAge: config.jwt.expiresInSec * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      };

      await authController.login(request, response);

      expect(userRepository.findByName).toHaveBeenCalledWith(request.body.name);
      expect(bcrypt.compare).toHaveBeenCalledWith(request.body.password, password);
      expect(jwt.sign).toHaveBeenCalledWith({ id }, config.jwt.secretKey, {
        expiresIn: config.jwt.expiresInSec,
      });
      expect(response.cookie).toHaveBeenCalledWith(config.cookie.tokenKey, token, options);
      expect(response._getJSONData()).toEqual({ token, user });
      expect(response._getJSONData().userId).toBeUndefined();
      expect(response._getJSONData().password).toBeUndefined();
      expect(response.statusCode).toBe(201);
    });
  });

  describe('findName', () => {
    let user: User;
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const name = faker.internet.userName();
      const phone = faker.phone.number('010########');
      user = User.parse({
        id: 1,
        name,
        password: faker.internet.password(),
        phone,
        email: faker.internet.email(),
        profile: {
          title: name,
          description: faker.random.words(3),
          image: faker.internet.avatar(),
          background: faker.internet.avatar(),
        },
        wallet: `0x${faker.random.numeric(40)}`,
      });

      request = httpMocks.createRequest({
        method: 'POST',
        url: '/auth/find-name',
        body: {
          phone,
        },
      });
      response = httpMocks.createResponse();
    });

    it('If the user cannot be found, returns 404 for the request', async () => {
      userRepository.findByPhone = jest.fn();

      const findName = async () => authController.findName(request, response);

      await expect(findName()).rejects.toThrow(new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404));
      expect(userRepository.findByPhone).toHaveBeenCalledWith(request.body.phone);
    });

    it('If the user found successfully, returns 200 for the request', async () => {
      userRepository.findByPhone = jest.fn(() => user);

      await authController.findName(request, response);

      expect(userRepository.findByPhone).toHaveBeenCalledWith(request.body.phone);
      expect(response._getJSONData()).toEqual({ name: user.name });
      expect(response.statusCode).toBe(200);
    });
  });

  describe('resetPassword', () => {
    let user: User;
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const name = faker.internet.userName();
      user = User.parse({
        id: 1,
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
      });

      request = httpMocks.createRequest({
        method: 'POST',
        url: '/auth/reset-password',
        body: {
          name,
          password: faker.internet.password(),
        },
      });
      response = httpMocks.createResponse();
    });

    it('If the user cannot be found, returns 404 for the request', async () => {
      userRepository.findByName = jest.fn();

      const resetPassword = async () => authController.resetPassword(request, response);

      await expect(resetPassword()).rejects.toThrow(new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404));
      expect(userRepository.findByName).toHaveBeenCalledWith(request.body.name);
    });

    it('If the password is changed, returns 201 for the request', async () => {
      userRepository.findByName = jest.fn(() => user);
      userRepository.updateUser = jest.fn();
      const hashed = faker.random.alphaNumeric(60);
      bcrypt.hash = jest.fn(async () => hashed);
      user.password = hashed;

      await authController.resetPassword(request, response);

      expect(userRepository.findByName).toHaveBeenCalledWith(request.body.name);
      expect(bcrypt.hash).toHaveBeenCalledWith(request.body.password, config.bcrypt.saltRounds);
      expect(userRepository.updateUser).toHaveBeenCalledWith(user.userId, user);
      expect(response.statusCode).toBe(201);
    });
  });

  describe('checkPhone', () => {
    let user: User;
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const name = faker.internet.userName();
      const phone = faker.phone.number('010########');
      user = User.parse({
        id: 1,
        name,
        password: faker.internet.password(),
        phone,
        email: faker.internet.email(),
        profile: {
          title: name,
          description: faker.random.words(3),
          image: faker.internet.avatar(),
          background: faker.internet.avatar(),
        },
        wallet: `0x${faker.random.numeric(40)}`,
      });

      request = httpMocks.createRequest({
        method: 'POST',
        url: '/auth/check-phone',
        body: {
          name,
          phone,
        },
      });
      response = httpMocks.createResponse();
    });

    it('If the user cannot be found, returns 404 for the request', async () => {
      userRepository.findByPhone = jest.fn();

      const checkPhone = async () => authController.checkPhone(request, response);

      await expect(checkPhone()).rejects.toThrow(new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404));
      expect(userRepository.findByPhone).toHaveBeenCalledWith(request.body.phone);
    });

    it('If the user does not match, returns 400 for the request', async () => {
      user.name = faker.internet.userName();
      userRepository.findByPhone = jest.fn(() => user);

      const checkPhone = async () => authController.checkPhone(request, response);

      await expect(checkPhone()).rejects.toThrow(
        new FailureObject(ErrorCode.INVALID_VALUE, 'Name does not match the owner of the phone', 400)
      );
      expect(userRepository.findByPhone).toHaveBeenCalledWith(request.body.phone);
    });

    it('If the user match, returns 200 for the request', async () => {
      userRepository.findByPhone = jest.fn(() => user);

      await authController.checkPhone(request, response);

      expect(userRepository.findByPhone).toHaveBeenCalledWith(request.body.phone);
      expect(response.statusCode).toBe(200);
    });
  });

  describe('update', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      request = httpMocks.createRequest({
        method: 'POST',
        url: '/auth/update',
        body: {
          phone: faker.phone.number('010########'),
          email: faker.internet.email(),
          profile: {
            title: faker.internet.userName(),
            description: faker.random.words(3),
            image: faker.internet.avatar(),
            background: faker.internet.avatar(),
          },
          wallet: `0x${faker.random.numeric(40)}`,
        },
      });
      response = httpMocks.createResponse();
    });

    it('If update is successful, returns 201 for the request', async () => {
      userRepository.updateUser = jest.fn();
      request.userId = 1;

      await authController.update(request, response);

      expect(userRepository.updateUser).toHaveBeenCalledWith(request.userId, User.parse(request.body));
      expect(response.statusCode).toBe(201);
    });
  });
});
