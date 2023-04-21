import Mongoose from 'mongoose';
import { MongoDB } from '../database/mongo';
import { Filter } from '../types/common';
import { Score } from '../types/score';
// a
const scoreSchema = new Mongoose.Schema({
  userId: { type: String, required: true },
  scoreId: { type: String },
  course: { type: String, required: true },
  date: { type: Date, required: true },
  firstHalfScore: { type: Number, required: true },
  secondHalfScore: { type: Number, required: true },
  image: { type: String, required: true },
});

scoreSchema.index({ userId: 1, socreId: 1 });
scoreSchema.index({ userId: 1, date: -1 });

MongoDB.useVirtualId(scoreSchema);
MongoDB.pre(scoreSchema, 'scoreId');
const ScoreModel = Mongoose.model('Score', scoreSchema);

export async function createScore(score: Score) {
  const result = await ScoreModel.create(score);
  return result.id;
}

export async function updateScore(score: Score) {
  const result = await ScoreModel.findOneAndUpdate({ userId: score.userId, scoreId: score.scoreId }, score, {
    returnOriginal: false,
  });
  return Score.parse(result);
}

export async function findScores(userId: string, filter: Filter) {
  const result = await ScoreModel.find({ userId }, null, filter.toJson());
  return result?.map((score) => Score.parse(score));
}

export async function removeScore(userId: string, scoreId: string) {
  const result = await ScoreModel.findOneAndRemove({ userId, scoreId }, { returnOriginal: false });
  return Score.parse(result);
}
