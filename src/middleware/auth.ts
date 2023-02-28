import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../../config';
import * as userRepository from '../data/auth';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import { FailureObject } from '../util/error.util';
import { ErrorCode } from '../types/error.util';

export const authHandler = async (req: Request, scopes: string[], schema: OpenAPIV3.SecuritySchemeObject) => {
  const authHeader = req.get('Authorization');
  let token = authHeader.split(' ')[1];

  if (!token) {
    token = req.cookies['token'];
  }

  if (!token) {
    const failure = new FailureObject(ErrorCode.NULL_ARGS, 'Authentication token should not be null', 401);
    throw failure;
  }

  const decoded = jwt.verify(token, config.jwt.secretKey);
  const user = await userRepository.findById((decoded as JwtPayload).id);
  if (!user) {
    const failure = new FailureObject(ErrorCode.INVALID_VALUE, 'Authentication token is invalid', 401);
    throw failure;
  }
  (req as any).userId = user.id;
  (req as any).token = decoded;
  return true;
};
