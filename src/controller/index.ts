import { linkRepository, userRepository, verifyRepository, scoreRepository } from '../data';
import { AuthController } from './auth';
import { LinkController } from './link';
import { ScoreController } from './score';
import { VerifyController } from './verify';

const controllers = {
  auth: new AuthController(userRepository),
  verify: new VerifyController(verifyRepository),
  link: new LinkController(linkRepository),
  score: new ScoreController(scoreRepository),
};

export default controllers;
