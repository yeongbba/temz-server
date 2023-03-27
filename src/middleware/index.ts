import * as userRepository from '../data/auth';
import { AuthHandler } from './auth';

const handlers = {
  auth: new AuthHandler(userRepository),
};

export default handlers;
