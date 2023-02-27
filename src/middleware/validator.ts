import { RequestHandler, NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as OpenApiValidator from 'express-openapi-validator';
import * as apis from '../controller';
import { authHandler } from './auth';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ message: errors.array()[0].msg });
};

export const validator = (apiDocPath: string) => {
  return OpenApiValidator.middleware({
    apiSpec: apiDocPath,
    validateResponses: true,

    operationHandlers: {
      basePath: __dirname,
      resolver: modulePathResolver,
    },
    validateSecurity: {
      handlers: {
        jwt_auth: authHandler,
      },
    },
  });
};

function modulePathResolver(basePath: string, route: any, apiDoc: any): RequestHandler {
  const pathKey = route.openApiRoute.slice(route.basePath.length);
  const operation = apiDoc.paths[pathKey][route.method.toLowerCase()];
  const methodName: string = operation.operationId;
  return apis[methodName];
}
