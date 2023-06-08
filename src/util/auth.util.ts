import { Request } from 'express';
import { config } from '../config';
import { ErrorCode } from '../types/error.util';
import { FailureObject } from './error.util';

export function getToken(req: Request, type: 'access' | 'refresh') {
  const isAccess = type === 'access' ? true : false;
  const tokenKey = isAccess ? config.cookie.accessTokenKey : config.cookie.refreshTokenKey;
  const header = isAccess ? 'Authorization' : 'R-Authorization';
  let token = req.cookies[tokenKey];

  const authHeader = req.header(header);
  if (!token && !authHeader) {
    const failure = new FailureObject(ErrorCode.INVALID_VALUE, `${header} header required`, 401);
    throw failure;
  }

  if (!token && !authHeader.startsWith('Bearer')) {
    const failure = new FailureObject(ErrorCode.INVALID_VALUE, `${header} header with scheme 'Bearer' required`, 401);
    throw failure;
  }

  token = token ?? authHeader.split(' ')[1];

  if (!token) {
    const failure = new FailureObject(ErrorCode.NULL_ARGS, `${header} token should not be null`, 401);
    throw failure;
  }

  return token;
}
