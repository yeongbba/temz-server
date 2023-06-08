import axios, { AxiosInstance } from 'axios';
import { AddressInfo } from 'net';
import { Index } from '../..';
import { config } from '../../config';
import { TestOptions } from '../../types/common';
import { ErrorCode } from '../../types/error.util';
import { FailureObject } from '../../util/error.util';
import verifyUtil from '../../util/sms.util';
import { fakeFailures } from '../../util/tests/error.util';
import {
  FakePhoneNumber,
  verifyMaxLengthTest,
  verifyMinLengthTest,
  verifyMissingTest,
  verifyPatternTest,
  verifyTypeTest,
} from '../../util/tests/verify.util';

describe('Verify APIs', () => {
  let index: Index;
  let request: AxiosInstance;
  const fakePhoneNumber: FakePhoneNumber = new FakePhoneNumber();

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

  describe('POST to /verify/token', () => {
    it('Return 200 if sms sent successfully', async () => {
      const phone = fakePhoneNumber.generate();

      const res = await request.post(`/verify/token`, {
        phone,
      });

      expect(res.status).toBe(200);
      expect(res.data.code).toHaveLength(6);
    });

    it('Return 429 if user send too many sms', async () => {
      const phone = fakePhoneNumber.generate();

      for (let i = 0; i < config.verification.allowCount; i++) {
        await request.post(`/verify/token`, { phone });
      }

      const res = await request.post(`/verify/token`, {
        phone,
      });

      expect(res.status).toBe(429);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.TOO_MANY_REQUEST, 'Sent too many requests', 429)])
      );
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const phone = fakePhoneNumber.generate();
        options = {
          method: 'post',
          url: '/verify/token',
          data: {
            phone,
          },
        };
      });

      const missingTest = verifyMissingTest([{ failedFieldName: 'phone' }]);
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const patternTest = verifyPatternTest();
      test.each(patternTest.value)(`${patternTest.name}`, async (value) => {
        await patternTest.testFn(request, options, value);
      });

      const typeTest = verifyTypeTest([{ failedFieldName: 'phone' }]);
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });
    });
  });

  describe('POST to /verify/check', () => {
    it('return 200 and status true if the code matches', async () => {
      const phone = fakePhoneNumber.generate();

      const sendTokenRes = await request.post(`/verify/token`, {
        phone,
      });

      const res = await request.post(`/verify/check`, {
        phone,
        code: sendTokenRes.data.code,
      });
      expect(res.status).toBe(200);
      expect(res.data).toEqual({ status: true });
    });

    it('return 200 and status false if the code matches', async () => {
      const phone = fakePhoneNumber.generate();

      await request.post(`/verify/token`, {
        phone,
      });

      const res = await request.post(`/verify/check`, {
        phone,
        code: verifyUtil.generateCode().toString(),
      });
      expect(res.status).toBe(200);
      expect(res.data).toEqual({ status: false });
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const phone = fakePhoneNumber.generate();
        const code = verifyUtil.generateCode().toString();
        options = {
          method: 'post',
          url: '/verify/check',
          data: {
            phone,
            code,
          },
        };
      });

      const missingTest = verifyMissingTest();
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const minLengthTest = verifyMinLengthTest();
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = verifyMaxLengthTest();
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const patternTest = verifyPatternTest();
      test.each(patternTest.value)(`${patternTest.name}`, async (value) => {
        await patternTest.testFn(request, options, value);
      });

      const typeTest = verifyTypeTest();
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });
    });
  });

  describe('POST to /verify/cancel', () => {
    it('return 201 if the code cancels successfully', async () => {
      const phone = fakePhoneNumber.generate();

      await request.post(`/verify/token`, {
        phone,
      });

      const res = await request.post(`/verify/cancel`, {
        phone,
      });

      expect(res.status).toBe(201);
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const phone = fakePhoneNumber.generate();
        options = {
          method: 'post',
          url: '/verify/cancel',
          data: {
            phone,
          },
        };
      });

      const missingTest = verifyMissingTest([{ failedFieldName: 'phone' }]);
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const patternTest = verifyPatternTest();
      test.each(patternTest.value)(`${patternTest.name}`, async (value) => {
        await patternTest.testFn(request, options, value);
      });

      const typeTest = verifyTypeTest([{ failedFieldName: 'phone' }]);
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });
    });
  });
});
