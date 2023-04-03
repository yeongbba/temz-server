import * as userRepository from '../data/auth';
import { AuthHandler } from './auth';
import { CsrfHandler } from './csrf';

const handlers = {
  auth: new AuthHandler(userRepository),
  csrf: new CsrfHandler(),
};

export default handlers;
