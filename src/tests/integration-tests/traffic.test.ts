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
import { TotalTraffic, Traffic } from '../../types/traffic';
import {
  fakeTraffic,
  trafficFormatTest,
  trafficMaxLengthTest,
  trafficMinLengthTest,
  trafficMinimumTest,
  trafficMissingTest,
  trafficTypeTest,
} from '../../util/tests/traffic.util';

describe('Traffic APIs', () => {
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

  describe('POST to /traffic', () => {
    it('Return 201 if traffic created successfully', async () => {
      const traffic = Traffic.parse(fakeTraffic(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };
      const res = await request.post(`/traffic`, traffic, {
        headers,
      });

      expect(res.status).toBe(201);
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const traffic = Traffic.parse(fakeTraffic(false)).toJson();
        options = { method: 'post', url: '/traffic', data: traffic };
      });

      const missingTest = trafficMissingTest();
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const formatTest = trafficFormatTest();
      test.each(formatTest.value)(`${formatTest.name}`, async (value) => {
        await formatTest.testFn(request, options, value);
      });

      const typeTest = trafficTypeTest();
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });

      const minLengthTest = trafficMinLengthTest();
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = trafficMaxLengthTest();
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const minimumTest = trafficMinimumTest();
      test.each(minimumTest.value)(`${minimumTest.name}`, async (value) => {
        await minimumTest.testFn(request, options, value);
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'traffic');
      });
    });
  });

  describe('PUT to /traffic', () => {
    it('Return 204 if traffic updated successfully', async () => {
      const fake = fakeTraffic(false);
      const traffic = Traffic.parse(fake).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/traffic`, traffic, {
        headers,
      });

      const getTraffic = await request.get(`/traffic`, {
        params: {
          date: fake.date,
        },
        headers,
      });

      const updateTraffic = Traffic.parse(fake).toJson();
      updateTraffic.trafficId = getTraffic.data.trafficId;

      const res = await request.put(`/traffic`, updateTraffic, {
        headers,
      });

      expect(res.status).toBe(204);
    });

    it('Return 404 if the traffic is not registered', async () => {
      const fake = fakeTraffic(false);
      const traffic = Traffic.parse(fake).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };
      const res = await request.put(`/traffic`, traffic, {
        headers,
      });

      expect(res.status).toBe(404);
      expect(res.data).toEqual(fakeFailures([new FailureObject(ErrorCode.NOT_FOUND, 'Traffic not found', 404)]));
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const traffic = Traffic.parse(fakeTraffic(false)).toJson();
        options = { method: 'put', url: '/traffic', data: traffic };
      });

      const missingTest = trafficMissingTest();
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const formatTest = trafficFormatTest();
      test.each(formatTest.value)(`${formatTest.name}`, async (value) => {
        await formatTest.testFn(request, options, value);
      });

      const typeTest = trafficTypeTest();
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });

      const minLengthTest = trafficMinLengthTest();
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = trafficMaxLengthTest();
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const minimumTest = trafficMinimumTest();
      test.each(minimumTest.value)(`${minimumTest.name}`, async (value) => {
        await minimumTest.testFn(request, options, value);
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'traffic');
      });
    });
  });

  describe.only('GET to /traffic/total', () => {
    test.only('Return 200 and total traffic if total traffic is found successfully', async () => {
      const fake = fakeTraffic(false);
      const traffic = Traffic.parse(fake).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/traffic`, traffic, {
        headers,
      });

      const res = await request.get(`/traffic/total`, {
        headers,
      });
      const savedTotalTraffic = TotalTraffic.parse({ total: fake.view }).toJson();

      expect(res.status).toBe(200);
      expect(res.data).toEqual(savedTotalTraffic);
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeAll(() => {
        options = { method: 'get', url: '/traffic/total' };
      });

      test.each(authMiddleWareTest)('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'total');
      });
    });
  });

  describe('GET to /traffic', () => {
    it('Return 200 and traffic if the traffic is found successfully', async () => {
      const fake = fakeTraffic(false);
      const traffic = Traffic.parse(fake).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/traffic`, traffic, {
        headers,
      });

      const res = await request.get(`/traffic`, {
        params: {
          date: fake.date,
        },
        headers,
      });
      const savedTraffic = Traffic.parse(traffic).toJson();
      savedTraffic.trafficId = res.data.trafficId;

      expect(res.status).toBe(200);
      expect(res.data).toEqual(savedTraffic);
    });

    it('Return 200 and 0 view in traffic if traffic is not found', async () => {
      const fake = fakeTraffic(false);
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };

      const res = await request.get(`/traffic`, {
        params: {
          date: fake.date,
        },
        headers,
      });

      expect(res.status).toBe(200);
      expect(res.data).toEqual(new Traffic().toJson());
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeAll(() => {
        options = { method: 'get', url: '/traffic' };
      });

      test.each(authMiddleWareTest)('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'traffic');
      });
    });
  });
});
