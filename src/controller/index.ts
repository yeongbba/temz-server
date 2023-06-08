import {
  linkRepository,
  userRepository,
  verifyRepository,
  scoreRepository,
  bookmarkRepository,
  equipmentRepository,
  trafficRepository,
} from '../data';
import { AuthController } from './auth';
import { BookmarkController } from './bookmark';
import { EquipmentController } from './equipment';
import { LinkController } from './link';
import { ScoreController } from './score';
import { TrafficController } from './traffic';
import { VerifyController } from './verify';

const controllers = {
  auth: new AuthController(userRepository),
  verify: new VerifyController(verifyRepository),
  link: new LinkController(linkRepository),
  score: new ScoreController(scoreRepository),
  bookmark: new BookmarkController(bookmarkRepository, userRepository),
  equipment: new EquipmentController(equipmentRepository, userRepository),
  traffic: new TrafficController(trafficRepository),
};

export default controllers;
