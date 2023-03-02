import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import fs from 'fs';
import deepmerge from 'deepmerge';
import cookieParser from 'cookie-parser';
import http from 'http';
import yaml from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import limiter from './middleware/rate-limiter';
import { config } from '../config';
import { MongoDB } from './database/mongo';
import { initSocket } from './connection/socket';
import { validator } from './middleware/validator';
import { ErrorCode } from './types/error.util';
import { FailureObject } from './util/error.util';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import { Redis } from './database/redis';

const corsOption = {
  origin: config.cors.allowedOrigin,
  optionsSuccessStatus: 200,
  credentials: true,
};

export async function startServer(port: number) {
  const app = express();
  const db = await MongoDB.createConnection(config.db.host, config.db.dbName);
  const redis = await Redis.createConnection(config.redis.url, parseInt(config.redis.rateLimitDb));

  app.use(express.json());
  app.use(cookieParser());
  app.use(helmet());
  app.use(cors(corsOption));
  app.use(morgan('tiny'));
  app.use(limiter(redis.client));

  const openApiDocument = createOpenApiDoc();
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use(validator(openApiDocument));

  app.use((req: Request, res: Response) => {
    console.error(req);
    res.status(404).json({
      code: ErrorCode.NOT_FOUND,
      message: 'Cannot found the resource',
      status: 404,
    });
  });

  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
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
        return new FailureObject(error.errorCode, error.message, status, reason);
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

  console.log(`Server is started to listen ${config.host.port} port`);
  const server = app.listen(port);
  initSocket(server);
  return { server, db, redis };
}

export async function stopServer(server: http.Server, db: MongoDB, redis: Redis): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close(async () => {
      try {
        await db.close();
        await redis.close();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

function createOpenApiDoc() {
  const openApiFiles = fs.readdirSync(path.join(__dirname, '/api'));
  const yamlObj = openApiFiles.map((file) => yaml.load(path.join(__dirname, `./api/${file}`)));
  return deepmerge.all(yamlObj) as OpenAPIV3.Document;
}
