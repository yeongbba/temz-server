import * as userRepository from '../data/auth';
import * as verifyRepository from '../data/verify';
import { AuthController } from './auth';
import { VerifyController } from './verify';

const controllers = {
  auth: new AuthController(userRepository),
  verify: new VerifyController(verifyRepository),
};

export default controllers;
