import httpMocks from 'node-mocks-http';
import { AuthHandler } from '../auth';
import { faker } from '@faker-js/faker';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { FailureObject } from '../../util/error.util';
import { ErrorCode } from '../../types/error.util';
import { config } from '../../config';
import { fakeUser } from '../../util/tests/auth.util';
import { User } from '../../types/auth';

jest.mock('jsonwebtoken');
jest.mock('../../data/auth');

describe('Auth Middleware', () => {
  let authHandler: AuthHandler;
  let userRepository: any;

  beforeEach(() => {
    userRepository = {};
    authHandler = new AuthHandler(userRepository);
  });

  it('returns 401 for the request without Authorization header and cookie', async () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: `/auth/me`,
    });

    const auth = async () => authHandler.verify(request);

    await expect(auth()).rejects.toStrictEqual(
      new FailureObject(ErrorCode.INVALID_VALUE, 'Authorization header required', 401)
    );
  });

  it('returns false for the request with unsupported Authorization token', async () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: `/auth/me`,
      headers: { Authorization: `Bearer ${faker.random.alphaNumeric(128)}` },
    });
    const token = request.header('Authorization')?.split(' ')[1];
    jwt.verify = jest.fn();

    const result = await authHandler.verify(request);

    expect(jwt.verify).toHaveBeenCalledWith(token, config.jwt.accessSecretKey);
    expect(result).toBeFalsy();
  });

  it('returns 401 for the request when cannot find a user by id from the JWT', async () => {
    const userId = faker.random.alphaNumeric(10);
    const request = httpMocks.createRequest({
      method: 'GET',
      url: `/auth/me`,
      headers: { Authorization: `Bearer ${faker.random.alphaNumeric(128)}` },
    });
    const token = request.header('Authorization')?.split(' ')[1];
    const mockFn = jest.fn();
    const decoded = { id: userId } as JwtPayload;
    jwt.verify = mockFn.mockImplementation(() => decoded);
    userRepository.findById = jest.fn();

    const auth = async () => authHandler.verify(request);

    await expect(auth()).rejects.toStrictEqual(
      new FailureObject(ErrorCode.INVALID_VALUE, 'Authentication token is invalid', 401)
    );
    expect(jwt.verify).toHaveBeenCalledWith(token, config.jwt.accessSecretKey);
    expect(userRepository.findById).toHaveBeenCalledWith(decoded.id);
  });

  it('passes a request with valid Authorization header', async () => {
    const userId = faker.random.alphaNumeric(10);
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/auth/me',
      headers: { Authorization: `Bearer ${faker.random.alphaNumeric(128)}` },
    });
    const token = request.header('Authorization')?.split(' ')[1];
    const mockFn = jest.fn();
    const decoded = { id: userId } as JwtPayload;
    jwt.verify = mockFn.mockImplementation(() => decoded);
    const user = new User(fakeUser(false));
    user.userId = decoded.id;
    userRepository.findById = jest.fn(() => user);

    const result = await authHandler.verify(request);

    expect(jwt.verify).toHaveBeenCalledWith(token, config.jwt.accessSecretKey);
    expect(userRepository.findById).toHaveBeenCalledWith(decoded.id);
    expect(request.userId).toBe(user.userId);
    expect(request.token).toBe(token);
    expect(result).toBeTruthy();
  });

  it('passes a request with valid Authorization cookie', async () => {
    const userId = faker.random.alphaNumeric(10);
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/auth/me',
      cookies: { [config.cookie.accessTokenKey]: faker.random.alphaNumeric(128) },
    });
    const token = request.cookies[config.cookie.accessTokenKey];
    const mockFn = jest.fn();
    const decoded = { id: userId } as JwtPayload;
    jwt.verify = mockFn.mockImplementation(() => decoded);
    const user = new User(fakeUser(false));
    user.userId = decoded.id;
    userRepository.findById = jest.fn(() => user);

    const result = await authHandler.verify(request);

    expect(jwt.verify).toHaveBeenCalledWith(token, config.jwt.accessSecretKey);
    expect(userRepository.findById).toHaveBeenCalledWith(decoded.id);
    expect(request.userId).toBe(user.userId);
    expect(request.token).toBe(token);
    expect(result).toBeTruthy();
  });
});
