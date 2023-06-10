import httpMocks from 'node-mocks-http';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { config } from '../../config';
import { ErrorCode } from '../../types/error.util';
import { FailureObject } from '../../util/error.util';
import { CsrfHandler } from '../csrf';

jest.mock('bcrypt');

describe('Csrf Middleware', () => {
  let csrfHandler: CsrfHandler;

  beforeEach(() => {
    csrfHandler = new CsrfHandler();
  });

  it('returns true when the method is a get request', async () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: `/auth/me`,
    });

    const csrf = await csrfHandler.csrfCheck(request);

    expect(csrf).toBeTruthy();
  });

  it('Returns true when the method is a options request', async () => {
    const request = httpMocks.createRequest({
      method: 'OPTIONS',
      url: `/auth/me`,
    });

    const csrf = await csrfHandler.csrfCheck(request);

    expect(csrf).toBeTruthy();
  });

  it('returns true when the method is a head request', async () => {
    const request = httpMocks.createRequest({
      method: 'HEAD',
      url: `/auth/me`,
    });

    const csrf = await csrfHandler.csrfCheck(request);

    expect(csrf).toBeTruthy();
  });

  it('returns 403 for the request without csrf header', async () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: `/auth/update`,
      body: {},
    });

    const csrf = async () => csrfHandler.csrfCheck(request);

    await expect(csrf()).rejects.toStrictEqual(
      new FailureObject(ErrorCode.NULL_ARGS, 'Csrf token should not be null', 403)
    );
  });

  it('returns 403 for the request with invalid csrf header', async () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: `/auth/update`,
      body: {},
      headers: { [config.csrf.tokenKey]: `${faker.string.alphanumeric(60)}` },
    });
    bcrypt.compare = jest.fn(async () => false);

    const csrf = async () => csrfHandler.csrfCheck(request);

    await expect(csrf()).rejects.toStrictEqual(
      new FailureObject(ErrorCode.INVALID_VALUE, 'Csrf token is invalid', 403)
    );
  });

  it('returns true for the request with valid csrf header', async () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: `/auth/update`,
      body: {},
      headers: { [config.csrf.tokenKey]: `${faker.string.alphanumeric(60)}` },
    });
    bcrypt.compare = jest.fn(async () => true);

    const csrf = await csrfHandler.csrfCheck(request);

    expect(csrf).toBeTruthy();
  });
});
