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
import { config } from '../config';
import { MongoDB } from './database/database';
import { initSocket } from './connection/socket';
import { validator } from './middleware/validator';
import { ErrorCode } from './types/error.util';
import { FailureObject } from './util/error.util';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';

const corsOption = {
  origin: config.cors.allowedOrigin,
  optionsSuccessStatus: 200,
  credentials: true,
};

export async function startServer(port: number) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(helmet());
  app.use(cors(corsOption));
  app.use(morgan('tiny'));

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
    const isFailureObject = error instanceof FailureObject;
    const failure = isFailureObject
      ? error
      : new FailureObject(ErrorCode.INTERNAL_SERVER, 'Internal Server Error', 500);
    res.status(failure.getStatus).json(failure);
  });

  const db = await MongoDB.createConnection(config.db.host, config.db.dbName);
  console.log(`Server is started to listen ${config.host.port} port`);
  const server = app.listen(port);
  initSocket(server);
  return { server, db };
}

export async function stopServer(server: http.Server, db: MongoDB): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close(async () => {
      try {
        await db.close();
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
