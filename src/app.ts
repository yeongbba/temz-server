import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import authRouter from './router/auth';
import { config } from '../config';
import { connectDB } from './database/database';

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan('tiny'));

app.use('/auth', authRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(req);
  res.sendStatus(404);
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  res.sendStatus(500);
});

connectDB()
  .then(db => {
    console.log("init", db);
    const server = app.listen(config.host.port);
    // initSocket(server);
  })
  .catch(console.error);
