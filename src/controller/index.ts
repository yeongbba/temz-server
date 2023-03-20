import * as userRepository from '../data/auth';
import { AuthController } from './auth';

const controllers = {
  auth: new AuthController(userRepository),
};

export default controllers;
