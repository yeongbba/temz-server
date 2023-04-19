import axios, { AxiosInstance } from 'axios';
import { AddressInfo } from 'net';
import { Index } from '../..';
import { config } from '../../config';
import { TestOptions } from '../../types/common';
import { ErrorCode } from '../../types/error.util';
import { Score } from '../../types/score';
import { FailureObject } from '../../util/error.util';
import { csrfToken, loginUser } from '../../util/tests/auth.util';
import { authMiddleWareTest, csrfMiddleWareTest } from '../../util/tests/common.util';
import { fakeFailures } from '../../util/tests/error.util';
import {
  fakeScore,
  scoreFormatTest,
  scoreMaximumTest,
  scoreMaxLengthTest,
  scoreMinimumTest,
  scoreMinLengthTest,
  scoreMissingTest,
  scoreTypeTest,
} from '../../util/tests/score.util';

describe('Score APIs', () => {
  let index: Index;
  let request: AxiosInstance;

  beforeAll(async () => {
    index = await Index.AsyncStart();
    request = axios.create({
      baseURL: `http://localhost:${(index.server.address() as AddressInfo).port}`,
      validateStatus: null,
    });
  });

  afterAll(async () => {
    await index.stop();
  });

  describe('POST to /score', () => {
    it('Return 201 if score created successfully', async () => {
      const score = Score.parse(fakeScore(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
      const res = await request.post(`/score`, score, {
        headers,
      });

      expect(res.status).toBe(201);
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const score = Score.parse(fakeScore(false)).toJson();
        options = { method: 'post', url: '/score', data: score };
      });

      const missingTest = scoreMissingTest();
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const formatTest = scoreFormatTest();
      test.each(formatTest.value)(`${formatTest.name}`, async (value) => {
        await formatTest.testFn(request, options, value);
      });

      const typeTest = scoreTypeTest();
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });

      const minLengthTest = scoreMinLengthTest();
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = scoreMaxLengthTest();
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const maximumTest = scoreMaximumTest();
      test.each(maximumTest.value)(`${maximumTest.name}`, async (value) => {
        await maximumTest.testFn(request, options, value);
      });

      const minimumTest = scoreMinimumTest();
      test.each(minimumTest.value)(`${minimumTest.name}`, async (value) => {
        await minimumTest.testFn(request, options, value);
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'score');
      });
    });
  });

  describe('PUT to /score', () => {
    it('Return 204 if score updated successfully', async () => {
      const score = Score.parse(fakeScore(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/score`, score, {
        headers,
      });

      const getScores = await request.get(`/score`, {
        headers,
      });

      const updateLinks = Score.parse(fakeScore(false)).toJson();
      updateLinks.scoreId = getScores.data.scores[0].scoreId;

      const res = await request.put(`/score`, updateLinks, {
        headers,
      });

      expect(res.status).toBe(204);
    });

    it('Return 404 if the score is not registered', async () => {
      const score = Score.parse(fakeScore()).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
      const res = await request.put(`/score`, score, {
        headers,
      });

      expect(res.status).toBe(404);
      expect(res.data).toEqual(fakeFailures([new FailureObject(ErrorCode.NOT_FOUND, 'Score not found', 404)]));
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const score = Score.parse(fakeScore()).toJson();
        options = { method: 'put', url: '/score', data: score };
      });

      const missingTest = scoreMissingTest();
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const formatTest = scoreFormatTest();
      test.each(formatTest.value)(`${formatTest.name}`, async (value) => {
        await formatTest.testFn(request, options, value);
      });

      const typeTest = scoreTypeTest();
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });

      const minLengthTest = scoreMinLengthTest();
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = scoreMaxLengthTest();
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const maximumTest = scoreMaximumTest();
      test.each(maximumTest.value)(`${maximumTest.name}`, async (value) => {
        await maximumTest.testFn(request, options, value);
      });

      const minimumTest = scoreMinimumTest();
      test.each(minimumTest.value)(`${minimumTest.name}`, async (value) => {
        await minimumTest.testFn(request, options, value);
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'score');
      });
    });
  });

  describe('GET to /score', () => {
    it('Return 200 and scores if the scores is found successfully without queryParams', async () => {
      const score = Score.parse(fakeScore(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/score`, score, {
        headers,
      });

      const res = await request.get(`/score`, {
        headers,
      });
      const savedScore = Score.parse(score).toJson();
      savedScore.scoreId = res.data.scores[0].scoreId;

      expect(res.status).toBe(200);
      expect(res.data.scores).toContainEqual(savedScore);
    });

    it('Return 200 and scores if the scores is found successfully with queryParams', async () => {
      const scores = new Array(3).fill(Score.parse(fakeScore(false)).toJson());
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };

      for (const score of scores) {
        await request.post(`/score`, score, {
          headers,
        });
      }

      const res = await request.get(`/score`, {
        headers,
        params: {
          limit: 3,
          skip: 1,
        },
      });
      const skipScores = scores.slice(1);
      skipScores.forEach((score, index) => {
        score.scoreId = res.data.scores[index].scoreId;
      });

      expect(res.status).toBe(200);
      expect(res.data.scores).toContainEqual(skipScores[0]);
      expect(res.data.scores).toContainEqual(skipScores[1]);
      expect(res.data.scores).toHaveLength(2);
    });

    it('Return 200 and empty array if scores are not found', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };

      const res = await request.get(`/score`, {
        headers,
      });

      expect(res.status).toBe(200);
      expect(res.data.scores).toHaveLength(0);
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeAll(() => {
        options = { method: 'get', url: '/score' };
      });

      test.each(authMiddleWareTest)('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'score');
      });
    });
  });

  describe.only('DELETE to /score', () => {
    it('Return 204 if the score removed successfully', async () => {
      const score = Score.parse(fakeScore(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/score`, score, {
        headers,
      });

      const getScores = await request.get(`/score`, {
        headers,
      });
      const scoreId = getScores.data.scores[0].scoreId;

      const res = await request.delete(`/score`, {
        params: {
          scoreId,
        },
        headers,
      });

      expect(res.status).toBe(204);
    });

    it('Return 404 if the score is not registered', async () => {
      const score = Score.parse(fakeScore()).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
      const res = await request.delete(`/score`, {
        params: {
          scoreId: score.scoreId,
        },
        headers,
      });

      expect(res.status).toBe(404);
      expect(res.data).toEqual(fakeFailures([new FailureObject(ErrorCode.NOT_FOUND, 'Score not found', 404)]));
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const score = Score.parse(fakeScore()).toJson();
        options = {
          method: 'delete',
          url: '/score',
          params: {
            scoreId: score.scoreId,
          },
        };
      });

      const minLengthTest = scoreMinLengthTest();
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = scoreMaxLengthTest([{ failedFieldName: 'scoreId' }]);
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const missingTest = scoreMissingTest([{ failedFieldName: 'scoreId' }]);
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'score');
      });
    });
  });
});
