import axios, { AxiosInstance } from 'axios';
import { AddressInfo } from 'net';
import { Index } from '../..';
import { config } from '../../config';

describe('Verify APIs', () => {
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

  describe('POST to /verify/token', () => {
    it('Return 200 if sms sent successfully', async () => {
      const phone = config.sens.hostPhone;

      const res = await request.post(`/verify/token`, {
        phone,
      });

      expect(res.status).toBe(200);
      expect(200).toBe(200);
    });

    // it('returns 400 when phone field is missing', async () => {
    //   const res = await request.post(`/verify/token`, {});

    //   expect(res.status).toBe(400);
    //   expect(res.data).toEqual(
    //     fakeFailures([
    //       new FailureObject(ErrorCode.REQUIRED_OPENAPI, `must have required property 'phone'`, 400, 'phone'),
    //     ])
    //   );
    // });

    // it(`returns 400 when phone field is wrong pattern`, async () => {
    //   const res = await request.post(`/verify/token`, {
    //     phone: faker.phone.number('011########'),
    //   });

    //   expect(res.status).toBe(400);
    //   expect(res.data).toEqual(
    //     fakeFailures([
    //       new FailureObject(ErrorCode.PATTERN_OPENAPI, `must match pattern "^(010)(\\d{4})(\\d{4})$"`, 400, 'phone'),
    //     ])
    //   );
    // });
  });
});
