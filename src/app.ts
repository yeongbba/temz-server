import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import http from 'http';
import yaml from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import authRouter from './router/auth';
import verifyRouter from './router/verify';
import { config } from '../config';
import { MongoDB } from './database/database';
import { initSocket } from './connection/socket';
import { validator } from './middleware/validator';

const corsOption = {
  origin: config.cors.allowedOrigin,
  optionsSuccessStatus: 200,
};

const openApiDocument = yaml.load(path.join(__dirname, './api/openapi.yaml'));

export async function startServer(port: number) {
  const app = express();
  app.use(express.json());
  app.use(helmet());
  app.use(cors(corsOption));
  app.use(morgan('tiny'));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  // app.use('/auth', authRouter);
  app.use('/verify', verifyRouter);
  app.use(validator(openApiDocument));

  app.use((req: Request, res: Response) => {
    console.log(req);
    res.sendStatus(404);
  });

  app.use((error: any, req: Request, res: Response) => {
    console.error(error);
    res.status(error.status || 500).json({
      message: error.message,
    });
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
