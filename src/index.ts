import { config } from '../config';
import { startServer } from './app';

startServer(config.host.port);
