import { Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import { FailureObject } from '../util/error.util';
import { ErrorCode } from '../types/error.util';

export class AuthHandler {
  constructor(private userRepository: any) {}

  verify = async (req: Request, scopes?: string[], schema?: OpenAPIV3.SecuritySchemeObject) => {
    const authHeader = req.header('Authorization');
    let token = authHeader?.split(' ')[1];

    if (!token) {
      token = req.cookies[config.cookie.tokenKey];
    }

    if (!token) {
      const failure = new FailureObject(ErrorCode.NULL_ARGS, 'Authentication token should not be null', 401);
      throw failure;
    }

    const decoded = jwt.verify(token, config.jwt.secretKey) as JwtPayload;

    if (decoded) {
      const user = await this.userRepository.findById((decoded as JwtPayload).id);

      if (!user) {
        const failure = new FailureObject(ErrorCode.INVALID_VALUE, 'Authentication token is invalid', 401);
        throw failure;
      }

      (req as any).userId = user.userId;
      (req as any).token = token;
      return true;
    }

    return false;
  };
}
