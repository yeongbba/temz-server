import { linkRepository, userRepository, verifyRepository, scoreRepository, bookmarkRepository } from '../data';
import { AuthController } from './auth';
import { BookmarkController } from './bookmark';
import { LinkController } from './link';
import { ScoreController } from './score';
import { VerifyController } from './verify';

const controllers = {
  auth: new AuthController(userRepository),
  verify: new VerifyController(verifyRepository),
  link: new LinkController(linkRepository),
  score: new ScoreController(scoreRepository),
  bookmark: new BookmarkController(bookmarkRepository, userRepository),
};

export default controllers;
