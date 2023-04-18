import { Request, Response } from 'express';
import { FailureObject } from '../util/error.util';
import { ErrorCode } from '../types/error.util';
import { Score } from '../types/score';
import { Filter } from '../types/common';
import { createSortMap } from '../util/common.util';

export class ScoreController {
  constructor(private scoreRepository: any) {}

  getScores = async (req: Request, res: Response) => {
    const limit = req.query.limit as string;
    const skip = req.query.skip as string;
    const sort = createSortMap('-date');

    const filter = Filter.parse({ limit, skip, sort });
    const scores: Score[] = await this.scoreRepository.findScores((req as any).userId, filter);
    res.status(200).json({ scores: scores.map((score) => score.toJson()) });
  };

  createScore = async (req: Request, res: Response) => {
    const score = req.body;
    const data = Score.parse({ userId: (req as any).userId, ...score });
    await this.scoreRepository.createScore(data);
    res.sendStatus(201);
  };

  updateScore = async (req: Request, res: Response) => {
    const score = req.body;

    const data = Score.parse({ id: score.scoreId, userId: (req as any).userId, ...score });
    const result: Score = await this.scoreRepository.updateScore(data);
    if (!result.scoreId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'Score not found', 404);
      throw failure;
    }
    res.sendStatus(204);
  };

  removeScore = async (req: Request, res: Response) => {
    const scoreId = req.query.scoreId as string;
    const result: Score = await this.scoreRepository.removeScore(scoreId);
    if (!result.scoreId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'Score not found', 404);
      throw failure;
    }
    res.sendStatus(204);
  };
}
