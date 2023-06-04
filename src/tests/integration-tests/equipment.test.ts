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
  equipmentFormatTest,
  equipmentItemCountTest,
  equipmentMaxLengthTest,
  equipmentMaximumTest,
  equipmentMinLengthTest,
  equipmentMinimumTest,
  equipmentMissingTest,
  equipmentTypeTest,
  fakeEquipment,
} from '../../util/tests/equipment.util';
import { Equipment } from '../../types/equipment';
import { faker } from '@faker-js/faker';

describe('Equipment APIs', () => {
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

  describe('POST to /equipment', () => {
    it('Return 201 if equipment created successfully', async () => {
      const equipment = Equipment.parse(fakeEquipment(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);
      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };
      const res = await request.post(`/equipment`, equipment, {
        headers,
      });
      expect(res.status).toBe(201);
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const equipment = Equipment.parse(fakeEquipment(false)).toJson();
        options = { method: 'post', url: '/equipment', data: equipment };
      });

      const missingTest = equipmentMissingTest();
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const formatTest = equipmentFormatTest();
      test.each(formatTest.value)(`${formatTest.name}`, async (value) => {
        await formatTest.testFn(request, options, value);
      });

      const typeTest = equipmentTypeTest();
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });

      const minLengthTest = equipmentMinLengthTest();
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = equipmentMaxLengthTest();
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const maximumTest = equipmentMaximumTest();
      test.each(maximumTest.value)(`${maximumTest.name}`, async (value) => {
        await maximumTest.testFn(request, options, value);
      });

      const minimumTest = equipmentMinimumTest();
      test.each(minimumTest.value)(`${minimumTest.name}`, async (value) => {
        await minimumTest.testFn(request, options, value);
      });

      const itemCountTest = equipmentItemCountTest();
      test.each(itemCountTest.value)(`${itemCountTest.name}`, async (value) => {
        await itemCountTest.testFn(request, options, value);
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'equipment');
      });
    });
  });

  describe('PUT to /equipment', () => {
    it('Return 204 if equipment updated successfully', async () => {
      const equipment = Equipment.parse(fakeEquipment(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/equipment`, equipment, {
        headers,
      });

      const getMyEquipment = await request.get(`/my-equipment`, {
        headers,
      });

      const updateEequipment = Equipment.parse(fakeEquipment(false)).toJson();
      updateEequipment.equipmentId = getMyEquipment.data.equipmentId;

      const res = await request.put(`/equipment`, updateEequipment, {
        headers,
      });

      expect(res.status).toBe(204);
    });

    it('Return 404 if the equipment is not registered', async () => {
      const equipment = Equipment.parse(fakeEquipment(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };
      const res = await request.put(`/equipment`, equipment, {
        headers,
      });

      expect(res.status).toBe(404);
      expect(res.data).toEqual(fakeFailures([new FailureObject(ErrorCode.NOT_FOUND, 'Equipment not found', 404)]));
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const equipment = Equipment.parse(fakeEquipment(false)).toJson();
        options = { method: 'put', url: '/equipment', data: equipment };
      });

      const missingTest = equipmentMissingTest();
      test.each(missingTest.value)(`${missingTest.name}`, async (value) => {
        await missingTest.testFn(request, options, value);
      });

      const formatTest = equipmentFormatTest();
      test.each(formatTest.value)(`${formatTest.name}`, async (value) => {
        await formatTest.testFn(request, options, value);
      });

      const typeTest = equipmentTypeTest();
      test.each(typeTest.value)(`${typeTest.name}`, async (value) => {
        await typeTest.testFn(request, options, value);
      });

      const minLengthTest = equipmentMinLengthTest();
      test.each(minLengthTest.value)(`${minLengthTest.name}`, async (value) => {
        await minLengthTest.testFn(request, options, value);
      });

      const maxLengthTest = equipmentMaxLengthTest();
      test.each(maxLengthTest.value)(`${maxLengthTest.name}`, async (value) => {
        await maxLengthTest.testFn(request, options, value);
      });

      const maximumTest = equipmentMaximumTest();
      test.each(maximumTest.value)(`${maximumTest.name}`, async (value) => {
        await maximumTest.testFn(request, options, value);
      });

      const minimumTest = equipmentMinimumTest();
      test.each(minimumTest.value)(`${minimumTest.name}`, async (value) => {
        await minimumTest.testFn(request, options, value);
      });

      const itemCountTest = equipmentItemCountTest();
      test.each(itemCountTest.value)(`${itemCountTest.name}`, async (value) => {
        await itemCountTest.testFn(request, options, value);
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'equipment');
      });
    });
  });

  describe('GET to /my-equipment', () => {
    it('Return 200 and equipment if the equipment is found successfully', async () => {
      const fake = fakeEquipment(false);
      const equipment = Equipment.parse(fake).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/my-equipment`, equipment, {
        headers,
      });

      const res = await request.get(`/my-equipment`, {
        headers,
      });

      equipment.equipmentId = res.data.equipmentId;

      expect(res.status).toBe(200);
      expect(res.data).toEqual(equipment);
    });

    it('Return 200 and empty equipment if the equipment is not found', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };

      const res = await request.get(`/my-equipment`, {
        headers,
      });

      expect(res.status).toBe(200);
      expect(res.data).toEqual(Equipment.parse(null).toJson());
    });

    describe.only('Request param test set', () => {
      let options: TestOptions;

      beforeAll(() => {
        options = { method: 'get', url: '/my-equipment' };
      });

      test.each(authMiddleWareTest)('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'my-equipment');
      });
    });
  });

  describe('GET to /equipment', () => {
    it('Return 200 and equipment if the equipments is found successfully with keywords', async () => {
      const fake = fakeEquipment(false);
      const equipment = Equipment.parse(fake).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/equipment`, equipment, {
        headers,
      });

      const res = await request.get(`/equipment`, {
        params: {
          limit: 3,
          skip: 0,
          keywords: fake.equipment[0].type,
        },
        headers,
      });
      const savedEquipment = Equipment.parse(equipment).toJson();
      savedEquipment.equipmentId = res.data.equipments[0].equipmentId;

      expect(res.status).toBe(200);
      expect(res.data.equipments).toContainEqual(savedEquipment);
    });

    it('Return 200 and equipments if the equipments is found successfully without keywords', async () => {
      const fake = fakeEquipment(false);
      const equipment = Equipment.parse(fake).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/equipment`, equipment, {
        headers,
      });

      const res = await request.get(`/equipment`, {
        headers,
        params: {
          limit: 3,
          skip: 0,
          type: fake.equipment[0].type,
          brand: fake.equipment[0].list[0].brand,
          model: fake.equipment[0].list[0].model,
        },
      });
      const savedEquipment = Equipment.parse(equipment).toJson();
      savedEquipment.equipmentId = res.data.equipments[0].equipmentId;

      expect(res.status).toBe(200);
      expect(res.data.equipments).toContainEqual(savedEquipment);
    });

    it('Return 200 and empty array if equipments are not found', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };

      const res = await request.get(`/equipment`, {
        headers,
        params: {
          keywords: faker.random.word(),
        },
      });

      expect(res.status).toBe(200);
      expect(res.data.equipments).toHaveLength(0);
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeAll(() => {
        options = { method: 'get', url: '/equipment' };
      });

      test.each(authMiddleWareTest)('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'equipment');
      });
    });
  });

  describe('DELETE to /equipment', () => {
    it('Return 204 if the equipment removed successfully', async () => {
      const equipment = Equipment.parse(fakeEquipment(false)).toJson();
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };

      await request.post(`/equipment`, equipment, {
        headers,
      });

      const res = await request.delete(`/equipment`, {
        headers,
      });

      expect(res.status).toBe(204);
    });

    it('Return 404 if the equipment is not registered', async () => {
      const { token } = await loginUser(request);
      const csrf = await csrfToken(request, token.access);

      const headers = { Authorization: `Bearer ${token.access}`, [config.csrf.tokenKey]: csrf.token };
      const res = await request.delete(`/equipment`, {
        headers,
      });

      expect(res.status).toBe(404);
      expect(res.data).toEqual(fakeFailures([new FailureObject(ErrorCode.NOT_FOUND, 'Equipment not found', 404)]));
    });

    describe('Request param test set', () => {
      let options: TestOptions;

      beforeEach(() => {
        const equipment = Equipment.parse(fakeEquipment(false)).toJson();
        options = {
          method: 'delete',
          url: '/equipment',
        };
      });

      test.each([...authMiddleWareTest, ...csrfMiddleWareTest])('$name', async ({ name, testFn }) => {
        await testFn(request, options, null, 'equipment');
      });
    });
  });
});
