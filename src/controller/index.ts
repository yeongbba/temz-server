import * as userRepository from '../data/auth';
import * as veerifyRepository from '../data/verify';
import { AuthController } from './auth';
import { VerifyController } from './verify';

const controllers = {
  auth: new AuthController(userRepository),
  verify: new VerifyController(veerifyRepository),
};

export default controllers;
