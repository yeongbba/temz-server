import { linkRepository, userRepository, verifyRepository } from '../data';
import { AuthController } from './auth';
import { LinkController } from './link';
import { VerifyController } from './verify';

const controllers = {
  auth: new AuthController(userRepository),
  verify: new VerifyController(verifyRepository),
  link: new LinkController(linkRepository),
};

export default controllers;
