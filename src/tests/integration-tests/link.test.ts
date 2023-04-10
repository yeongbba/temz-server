import { faker } from '@faker-js/faker';
import axios, { AxiosInstance } from 'axios';
import { AddressInfo } from 'net';
import { Index } from '../..';
import { config } from '../../config';
import { ErrorCode } from '../../types/error.util';
import { FailureObject } from '../../util/error.util';
import { authMiddleWareTest, csrfMiddleWareTest, csrfToken, loginUser } from '../../util/tests/auth.util';
import { fakeFailures } from '../../util/tests/error.util';
import { fakeLinks } from '../../util/tests/link.util';

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

      const res = await request.post(
        `/link`,
        {
          ...links,
        },
        {
          headers: { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token },
        }
      );

      expect(res.status).toBe(201);
    });

    it('Return 409 if the link is already registered', async () => {
      const links = fakeLinks(false);
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);

      const firstRes = await request.post(
        `/link`,
        {
          ...links,
        },
        {
          headers: { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token },
        }
      );

      const secondRes = await request.post(
        `/link`,
        {
          ...links,
        },
        {
          headers: { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token },
        }
      );

      expect(secondRes.status).toBe(409);
      expect(secondRes.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.DUPLICATED_VALUE, `Links already exist`, 409)])
      );
    });

    test.each([
      { missingFieldName: 'links' },
      { parentFieldName: 'links', missingFieldName: 'general' },
      { parentFieldName: 'links.general', missingFieldName: 'title' },
      { parentFieldName: 'links.general', missingFieldName: 'links' },
      { parentFieldName: 'links.general.links', missingFieldName: 'description' },
      { parentFieldName: 'links.general.links', missingFieldName: 'link' },
    ])(`returns 400 when $missingFieldName field is missing`, async ({ parentFieldName, missingFieldName }) => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);
      const links = fakeLinks(false);

      if (parentFieldName) {
        let currentField = links;
        parentFieldName.split('.').forEach((field) => {
          if (Array.isArray(currentField[field])) {
            currentField = currentField[field][0];
          } else {
            currentField = currentField[field];
          }
        });
        delete currentField[missingFieldName];
      } else {
        delete links[missingFieldName];
      }

      const res = await request.post(
        `/link`,
        {
          ...links,
        },
        {
          headers: { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token },
        }
      );

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([
          new FailureObject(
            ErrorCode.REQUIRED_OPENAPI,
            `must have required property '${missingFieldName}'`,
            400,
            missingFieldName
          ),
        ])
      );
    });

    test.each([
      { parentFieldName: 'links', failedFieldName: 'youtube' },
      { parentFieldName: 'links', failedFieldName: 'twitter' },
      { parentFieldName: 'links', failedFieldName: 'tiktok' },
      { parentFieldName: 'links', failedFieldName: 'instagram' },
      { parentFieldName: 'links', failedFieldName: 'facebook' },
      { parentFieldName: 'links', failedFieldName: 'telegram' },
      { parentFieldName: 'links.general.links', failedFieldName: 'link' },
    ])(`returns 400 when $failedFieldName field is wrong format`, async ({ parentFieldName, failedFieldName }) => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token);
      const links = fakeLinks(false);
      const wrongValue = faker.random.alpha(10);

      if (parentFieldName) {
        let currentField = links;
        parentFieldName.split('.').forEach((field) => {
          if (Array.isArray(currentField[field])) {
            currentField = currentField[field][0];
          } else {
            currentField = currentField[field];
          }
        });
        currentField[failedFieldName] = wrongValue;
      } else {
        links[failedFieldName] = wrongValue;
      }

      const res = await request.post(
        `/link`,
        {
          ...links,
        },
        {
          headers: { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token },
        }
      );

      expect(res.status).toBe(400);
      expect(res.data).toEqual(
        fakeFailures([new FailureObject(ErrorCode.FORMAT_OPENAPI, `must match format "url"`, 400, failedFieldName)])
      );
    });

    test.each([
      {
        parentFieldName: 'links.general',
        failedFieldName: 'title',
        value: faker.random.alpha({ count: 51 }),
        maxLength: 50,
      },
      {
        parentFieldName: 'links.general.links',
        failedFieldName: 'description',
        value: faker.random.alpha({ count: 51 }),
        maxLength: 50,
      },
    ])(
      `returns 400 when $failedFieldName field length is too long`,
      async ({ parentFieldName, failedFieldName, value, maxLength }) => {
        const { token } = await loginUser(request);
        const csrf = await csrfToken(request, token);
        const links = fakeLinks(false);

        if (parentFieldName) {
          let currentField = links;
          parentFieldName.split('.').forEach((field) => {
            if (Array.isArray(currentField[field])) {
              currentField = currentField[field][0];
            } else {
              currentField = currentField[field];
            }
          });
          currentField[failedFieldName] = value;
        } else {
          links[failedFieldName] = value;
        }

        const res = await request.post(
          `/link`,
          {
            ...links,
          },
          {
            headers: { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token },
          }
        );

        expect(res.status).toBe(400);
        expect(res.data).toEqual(
          fakeFailures([
            new FailureObject(
              ErrorCode.MAXLENGTH_OPENAPI,
              `must NOT have more than ${maxLength} characters`,
              400,
              failedFieldName
            ),
          ])
        );
      }
    );

    test.each([
      {
        parentFieldName: 'links',
        failedFieldName: 'general',
        maxItems: 5,
      },
      {
        parentFieldName: 'links.general',
        failedFieldName: 'links',
        maxItems: 9,
      },
    ])(
      `returns 400 when $failedFieldName field exceed max item count`,
      async ({ parentFieldName, failedFieldName, maxItems }) => {
        const { token } = await loginUser(request);
        const csrf = await csrfToken(request, token);
        const links = fakeLinks(false);
        let array = [];
        let item = null;

        if (parentFieldName) {
          let currentField = links;
          parentFieldName.split('.').forEach((field) => {
            if (Array.isArray(currentField[field])) {
              currentField = currentField[field][0];
            } else {
              currentField = currentField[field];
            }
          });
          array = currentField[failedFieldName];
          item = currentField[failedFieldName][0];
        } else {
          array = links[failedFieldName];
          item = links[failedFieldName][0];
        }

        for (let i = 0; i <= maxItems; i++) {
          if (item) {
            array.push(item);
          }
        }

        const res = await request.post(
          `/link`,
          {
            ...links,
          },
          {
            headers: { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token },
          }
        );

        expect(res.status).toBe(400);
        expect(res.data).toEqual(
          fakeFailures([
            new FailureObject(
              ErrorCode.MAXITEMS_OPENAPI,
              `must NOT have more than ${maxItems} items`,
              400,
              failedFieldName
            ),
          ])
        );
      }
    );

    test.each([
      {
        failedFieldName: 'links',
        value: faker.random.alpha({ count: 10 }),
        type: 'object',
      },
      {
        parentFieldName: 'links',
        failedFieldName: 'general',
        value: faker.random.alpha({ count: 10 }),
        type: 'array',
      },
      {
        parentFieldName: 'links.general',
        failedFieldName: 'title',
        value: parseInt(faker.random.numeric(5)),
        type: 'string',
      },
      {
        parentFieldName: 'links.general',
        failedFieldName: 'links',
        value: faker.random.alpha({ count: 10 }),
        type: 'array',
      },
      {
        parentFieldName: 'links.general.links',
        failedFieldName: 'description',
        value: parseInt(faker.random.numeric(5)),
        type: 'string',
      },
    ])(
      `returns 400 when $failedFieldName field is wrong type`,
      async ({ parentFieldName, failedFieldName, value, type }) => {
        const { token } = await loginUser(request);
        const csrf = await csrfToken(request, token);
        const links = fakeLinks(false);

        if (parentFieldName) {
          let currentField = links;
          parentFieldName.split('.').forEach((field) => {
            if (Array.isArray(currentField[field])) {
              currentField = currentField[field][0];
            } else {
              currentField = currentField[field];
            }
          });
          currentField[failedFieldName] = value;
        } else {
          links[failedFieldName] = value;
        }

        const res = await request.post(
          `/link`,
          {
            ...links,
          },
          {
            headers: { Authorization: `Bearer ${token}`, [config.csrf.tokenKey]: csrf.token },
          }
        );

        expect(res.status).toBe(400);
        expect(res.data).toEqual(
          fakeFailures([new FailureObject(ErrorCode.TYPE_OPENAPI, `must be ${type}`, 400, failedFieldName)])
        );
      }
    );

    test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
      await testFn(request, { method: 'post', url: '/link', data: {} }, 'link');
    });
  });
});
