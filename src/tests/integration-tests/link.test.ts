import axios, { AxiosInstance } from 'axios';
import { AddressInfo } from 'net';
import { Index } from '../..';
import { config } from '../../config';
import { TestOptions } from '../../types/common';
import { ErrorCode } from '../../types/error.util';
import { FailureObject } from '../../util/error.util';
import { csrfToken, loginUser } from '../../util/tests/auth.util';
import { authMiddleWareTest, csrfMiddleWareTest } from '../../util/tests/common.util';
import { fakeFailures } from '../../util/tests/error.util';
import {
  fakeLinks,
  linkFormatTest,
  linkItemCountTest,
  linkMaxLengthTest,
  linkMissingTest,
  linkTypeTest,
} from '../../util/tests/link.util';

describe('Link APIs', () => {
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

  describe('POST to /link', () => {
    it('Return 201 if link created successfully', async () => {
      const links = fakeLinks(false);
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
      const res = await request.post(
        `/link`,
        {
          ...links,
        },
        {
          headers,
        }
      );

      expect(res.status).toBe(201);
    });

    it('Return 409 if the link is already registered', async () => {
      const links = fakeLinks(false);
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const headers = { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token };
      const firstRes = await request.post(
        `/link`,
        {
          ...links,
        },
        {
          headers,
        }
      );

      const secondRes = await request.post(
        `/link`,
        {
          ...links,
        },
        {
          headers,
        }
      );

      expect(secondRes.status).toBe(409);
      expect(secondRes.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.DUPLICATED_VALUE, `Links already exist`, 409)])
      );
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const links = fakeLinks(false);
        options = { method: 'post', url: '/link', data: links };
      });

      const missingTest = linkMissingTest();
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const formatTest = linkFormatTest();
      test.each(formatTest.value)(`${formatTest.name}`, async (value) => {
        await formatTest.testFn(request, options, value);
      });

      const maxLengthTest = linkMaxLengthTest();
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const itemCountTest = linkItemCountTest();
      test.each(itemCountTest.value)(`${itemCountTest.name}`, async (value) => {
        await itemCountTest.testFn(request, options, value);
      });

      const typeTest = linkTypeTest();
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'link');
      });
    });
  });
});
