import bcrypt from 'bcrypt';
import { config } from '../config';
import { Request } from 'express';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import { FailureObject } from '../util/error.util';
import { ErrorCode } from '../types/error.util';

export const csrfCheck = async (req: Request, scopes: string[], schema: OpenAPIV3.SecuritySchemeObject) => {
  if (req.method === 'GET' || req.method === 'OPTIONS' || req.method === 'HEAD') {
    return true;
  }

  const token = req.get(config.csrf.tokenKey);
  if (!token) {
    const failure = new FailureObject(ErrorCode.NULL_ARGS, 'Csrf token should not be null', 403);
    throw failure;
  }

  const valid = await validateCsrfToken(token);
  if (!valid) {
    const failure = new FailureObject(ErrorCode.INVALID_VALUE, 'Csrf token is invalid', 403);
    throw failure;
  }
  return true;
};

async function validateCsrfToken(token: string) {
  return bcrypt.compare(config.csrf.plainToken, token);
}
