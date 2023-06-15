import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import fs from 'fs';
import deepmerge from 'deepmerge';
import cookieParser from 'cookie-parser';
import yaml from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import limiter from './middleware/rate-limiter';
import { MongoDB } from './database/mongo';
import { Redis } from './database/redis';
import { config } from './config';
import { initSocket } from './connection/socket';
import { validator } from './middleware/validator';
import { ErrorCode } from './types/error.util';
import { FailureObject } from './util/error.util';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import { ServerInfo } from './types/common';

const corsOption = {
  origin: config.cors.allowedOrigin,
  optionsSuccessStatus: 200,
  credentials: true,
};

export async function startServer(port?: number): Promise<ServerInfo> {
  const app = express();
  console.log('mongo: ', config.db.host);
  console.log('redis: ', config.redis.url);
  const db = await MongoDB.createConnection(config.db.host, config.db.dbName);
  const rateLimitDB = await Redis.createConnection(config.redis.url, parseInt(config.redis.rateLimitDB));
  const verifyCodeDB = await Redis.createConnection(config.redis.url, parseInt(config.redis.verifyCodeDB));
  const redis = { rateLimitDB, verifyCodeDB };

  app.use(express.json());
  app.use(cookieParser());
  app.use(helmet());
  app.use(cors(corsOption));

  app.use(limiter(rateLimitDB.client));
  if (!config.environment.test) {
    app.use(morgan('tiny'));
  }

  const openAPIDocument = createOpenAPIDoc();
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openAPIDocument));
  app.use(validator(openAPIDocument));

  app.use((req: Request, res: Response) => {
    if (!config.environment.test) {
      console.error(req);
    }
    res.status(404).json({
      code: ErrorCode.NOT_FOUND,
      message: 'Cannot found the resource',
      status: 404,
    });
  });

  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    if (!config.environment.test) {
      console.error(req);
    }

    let failures = [];
    const isFailureObject = error instanceof FailureObject;
    if (isFailureObject) {
      failures.push(error);
      res.status(error.getStatus).json({ failures });
      return;
    }

    if (error.errors) {
      const status = error.status;
      failures = error.errors.map((error: any) => {
        const path = error.path.split('/');
        const reason = path[path.length - 1];
        const errorCode = error?.errorCode || ErrorCode.INVALID_VALUE;
        return new FailureObject(errorCode, error.message, status, reason);
      });
      res.status(status).json({ failures });
      return;
    } else {
      const failure = new FailureObject(ErrorCode.INTERNAL_SERVER, 'Internal Server Error', 500);
      failures.push(failure);
      res.status(failure.getStatus).json({ failures });
      return;
    }
  });

  console.log(`Server is started to listen ${port} port`);
  const server = app.listen(port);
  initSocket(server);
  return { server, db, redis };
}

export async function stopServer(info: ServerInfo): Promise<void> {
  return new Promise((resolve, reject) => {
    const { server, db, redis } = info;
    server.close(async () => {
      try {
        await db.close();
        for (const key in redis) {
          if (Object.prototype.hasOwnProperty.call(redis, key)) {
            await redis[key].close();
          }
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

function createOpenAPIDoc() {
  const openAPIFiles = fs.readdirSync(path.join(__dirname, '/api'));
  const yamlObj = openAPIFiles.map((file) => yaml.load(path.join(__dirname, `/api/${file}`)));
  return deepmerge.all(yamlObj) as OpenAPIV3.Document;
}
