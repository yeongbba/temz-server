import httpMocks from 'node-mocks-http';
import { faker } from '@faker-js/faker';
import { ErrorCode } from '../../types/error.util';
import { FailureObject } from '../../util/error.util';
import { ScoreController } from '../score';
import { fakeScore } from '../../util/tests/score.util';
import { Score } from '../../types/score';
import { createSortMap } from '../../util/common.util';
import { Filter } from '../../types/common';

describe('Score Controller', () => {
  let scoreController: ScoreController;
  let scoreRepository: any;

  beforeEach(() => {
    scoreRepository = {};
    scoreController = new ScoreController(scoreRepository);
  });

  describe('createScore', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const score = Score.parse(fakeScore(false)).toJson();

      request = httpMocks.createRequest({
        method: 'POST',
        url: `/score`,
        body: score,
      });
      response = httpMocks.createResponse();
    });

    it('Return 201, if score is created successfully', async () => {
      request.userId = faker.random.alphaNumeric(24);
      scoreRepository.createScore = jest.fn();

      await scoreController.createScore(request, response);

      expect(scoreRepository.createScore).toHaveBeenCalledWith(
        Score.parse({ userId: request.userId, ...request.body })
      );
      expect(response.statusCode).toBe(201);
    });
  });

  describe('updateScore', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const score = Score.parse(fakeScore()).toJson();

      request = httpMocks.createRequest({
        method: 'PUT',
        url: `/score`,
        body: score,
      });
      response = httpMocks.createResponse();
    });

    it('Return 404 if there is no registered score', async () => {
      request.userId = faker.random.alphaNumeric(24);
      scoreRepository.updateScore = jest.fn(() => Score.parse(null));

      const updateScore = async () => scoreController.updateScore(request, response);

      await expect(updateScore()).rejects.toStrictEqual(new FailureObject(ErrorCode.NOT_FOUND, 'Score not found', 404));
      expect(scoreRepository.updateScore).toHaveBeenCalledWith({ userId: request.userId, ...request.body });
    });

    it('Return 204, if social link is updated successfully', async () => {
      request.userId = faker.random.alphaNumeric(24);
      scoreRepository.updateScore = jest.fn(() => Score.parse({ id: faker.random.alphaNumeric(24) }));

      await scoreController.updateScore(request, response);

      expect(scoreRepository.updateScore).toHaveBeenCalledWith({ userId: request.userId, ...request.body });
      expect(response.statusCode).toBe(204);
    });
  });

  describe('getScores', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      request = httpMocks.createRequest({
        method: 'GET',
        url: `/score`,
      });
      response = httpMocks.createResponse();
    });

    it('Return 200, if general link successfully found', async () => {
      request.userId = faker.random.alphaNumeric(24);
      const limit = request.query.limit as string;
      const skip = request.query.skip as string;
      const sort = createSortMap('-date');
      const filter = Filter.parse({ limit, skip, sort });
      const scores = [Score.parse({ userId: request.userId, ...fakeScore() })];
      scoreRepository.findScores = jest.fn(() => scores);

      await scoreController.getScores(request, response);

      expect(scoreRepository.findScores).toHaveBeenCalledWith(request.userId, filter);
      expect(response._getJSONData()).toEqual({ scores: scores.map((score) => score.toJson()) });
      expect(response.statusCode).toBe(200);
    });
  });

  describe('removeScore', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const score = fakeScore();

      request = httpMocks.createRequest({
        method: 'DELETE',
        url: `/score`,
        query: { scoreId: score.id },
      });
      response = httpMocks.createResponse();
    });

    it('Return 204, if score successfully removed', async () => {
      const scoreId = request.query.scoreId;
      scoreRepository.removeScore = jest.fn(() => Score.parse({ id: scoreId }));

      await scoreController.removeScore(request, response);

      expect(scoreRepository.removeScore).toHaveBeenCalledWith(scoreId);
      expect(response.statusCode).toBe(204);
    });

    it('Return 404 if there is no registered score', async () => {
      const scoreId = request.query.scoreId;
      scoreRepository.removeScore = jest.fn(() => Score.parse(null));

      const removeScore = async () => scoreController.removeScore(request, response);

      await expect(removeScore()).rejects.toStrictEqual(new FailureObject(ErrorCode.NOT_FOUND, 'Score not found', 404));
      expect(scoreRepository.removeScore).toHaveBeenCalledWith(scoreId);
    });
  });
});
