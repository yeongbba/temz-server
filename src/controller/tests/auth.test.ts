import httpMocks from 'node-mocks-http';
import { signup } from '../auth';
// import { faker } from '@faker-js/faker';
// import * as jwt from 'jsonwebtoken';
import * as userRepository from '../../data/auth';
import { setValueToOnlyReadProp } from '../../common/test.util';

jest.mock('jsonwebtoken');
jest.mock('../../data/auth');

describe('Auth Controller', () => {
  it('returns 409 for the request if user has already signed up', async () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/auth/signup',
      body: {
        username: 'abcdef',
      },
    });
    const response = httpMocks.createResponse();
    setValueToOnlyReadProp(
      userRepository,
      'findByUsername',
      jest.fn((user) => Promise.resolve({ user }))
    );
    await signup(request, response);
    expect(response.statusCode).toBe(409);
    expect(response._getJSONData().message).toBe(`abcdef already exists`);
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
