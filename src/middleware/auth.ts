import { Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import { FailureObject } from '../util/error.util';
import { ErrorCode } from '../types/error.util';
import { getToken } from '../util/auth.util';

export class AuthHandler {
  constructor(private userRepository: any) {}

  verify = async (req: Request, scopes?: string[], schema?: OpenAPIV3.SecuritySchemeObject) => {
    const token = getToken(req, 'access');
    const decoded = jwt.verify(token, config.jwt.accessSecretKey) as JwtPayload;

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
