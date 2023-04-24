import { Request } from 'express';
import { config } from '../config';
import { ErrorCode } from '../types/error.util';
import { FailureObject } from './error.util';

export function getToken(req: Request, type: 'access' | 'refresh') {
  const isAccess = type === 'access' ? true : false;
  const tokenKey = isAccess ? config.cookie.accessTokenKey : config.cookie.refreshTokenKey;
  const header = isAccess ? 'Authorization' : 'R-Authorization';

  const authHeader = req.header(header);
  let token = authHeader?.split(' ')[1];

  if (!token) {
    token = req.cookies[tokenKey];
  }

  if (!token) {
    const failure = new FailureObject(ErrorCode.NULL_ARGS, `${header} token should not be null`, 401);
    throw failure;
  }

  return token;
}
