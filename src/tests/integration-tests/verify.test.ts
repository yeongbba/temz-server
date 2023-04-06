import { faker } from '@faker-js/faker';
import axios, { AxiosInstance } from 'axios';
import { AddressInfo } from 'net';
import { Index } from '../..';
import { ErrorCode } from '../../types/error.util';
import { FailureObject } from '../../util/error.util';
import verifyUtil from '../../util/sms.util';
import { fakeFailures } from '../../util/tests/error.util';
import { FakePhoneNumber } from '../../util/tests/verify.util';

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

      const firstRes = await request.post(`/verify/token`, {
        phone,
      });

      const secondRes = await request.post(`/verify/token`, {
        phone,
      });

      expect(secondRes.status).toBe(429);
      expect(secondRes.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.TOO_MANY_REQUEST, 'Sent too many requests', 429)])
      );
    });

    it('returns 400 when phone field is missing', async () => {
      const res = await request.post(`/verify/token`, {});

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.REQUIRED_OPENAPI, `must have required property 'phone'`, 400, 'phone'),
        ])
      );
    });

    it(`returns 400 when phone field is wrong pattern`, async () => {
      const res = await request.post(`/verify/token`, {
        phone: faker.phone.number('011########'),
      });

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(ErrorCode.PATTERN_OPENAPI, `must match pattern "^(010)(\\d{4})(\\d{4})$"`, 400, 'phone'),
        ])
      );
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
  });
});
