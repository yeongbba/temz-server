import httpMocks from 'node-mocks-http';
import { ErrorCode } from '../../types/error.util';
import { FailureObject } from '../../util/error.util';
import { EquipmentController } from '../equipment';
import { Filter } from '../../types/common';
import { fakeEquipment } from '../../util/tests/equipment.util';
import { Equipment } from '../../types/equipment';
import { User } from '../../types/auth';
import { fakeUser } from '../../util/tests/auth.util';
import { faker } from '@faker-js/faker';

describe('Equipment Controller', () => {
  let equipmentController: EquipmentController;
  let equipmentRepository: any;
  let userRepository: any;

  beforeEach(() => {
    equipmentRepository = {};
    userRepository = {};
    equipmentController = new EquipmentController(equipmentRepository, userRepository);
  });

  describe('createEquipment', () => {
    let user: User;
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      user = User.parse(fakeUser());
      const equipment = Equipment.parse(fakeEquipment(false)).toJson();

      request = httpMocks.createRequest({
        method: 'POST',
        url: `/equpment`,
        body: equipment,
      });
      response = httpMocks.createResponse();
    });

    it('Return 404 if there is no user', async () => {
      request.userId = user.userId;
      userRepository.findById = jest.fn(() => User.parse(null));

      const createEquipment = async () => equipmentController.createEquipment(request, response);

      await expect(createEquipment()).rejects.toStrictEqual(
        new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404)
      );
      expect(userRepository.findById).toHaveBeenCalledWith(request.userId);
    });

    it('Return 201, if equipment is created successfully', async () => {
      request.userId = user.userId;
      equipmentRepository.createEquipment = jest.fn();
      userRepository.findById = jest.fn(() => user);

      await equipmentController.createEquipment(request, response);

      expect(equipmentRepository.createEquipment).toHaveBeenCalledWith(
        Equipment.parse({
          userId: request.userId,
          userName: user.name,
          userImage: user.profile?.image,
          ...request.body,
        })
      );
      expect(response.statusCode).toBe(201);
    });
  });

  describe('updateEquipment', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const equipment = Equipment.parse(fakeEquipment()).toJson();

      request = httpMocks.createRequest({
        method: 'PUT',
        url: `/equipment`,
        body: equipment,
      });
      response = httpMocks.createResponse();
    });

    it('Return 404 if there is no registered equipment', async () => {
      equipmentRepository.updateEquipment = jest.fn(() => Equipment.parse(null));

      const updateEquipment = async () => equipmentController.updateEquipment(request, response);

      await expect(updateEquipment()).rejects.toStrictEqual(
        new FailureObject(ErrorCode.NOT_FOUND, 'Equipment not found', 404)
      );
      expect(equipmentRepository.updateEquipment).toHaveBeenCalledWith({ userId: request.userId, ...request.body });
    });

    it('Return 204, if equipment is updated successfully', async () => {
      equipmentRepository.updateEquipment = jest.fn(() => Equipment.parse({ id: faker.random.alphaNumeric(24) }));

      await equipmentController.updateEquipment(request, response);

      expect(equipmentRepository.updateEquipment).toHaveBeenCalledWith({ userId: request.userId, ...request.body });
      expect(response.statusCode).toBe(204);
    });
  });

  describe('getMyEquipment', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      request = httpMocks.createRequest({
        method: 'GET',
        url: `/my-equipment`,
      });
      response = httpMocks.createResponse();
    });

    it('Return 200, if my equipment successfully found', async () => {
      request.userId = faker.random.alphaNumeric(24);
      const equipment = Equipment.parse(fakeEquipment());
      equipmentRepository.findMyEquipment = jest.fn(() => equipment);

      await equipmentController.getMyEquipment(request, response);

      expect(equipmentRepository.findMyEquipment).toHaveBeenCalledWith(request.userId);
      expect(response._getJSONData()).toEqual(equipment.toJson());
      expect(response.statusCode).toBe(200);
    });
  });

  describe('getEquipments', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      request = httpMocks.createRequest({
        method: 'GET',
        url: `/equipment`,
        query: { limit: 30, skip: 0 },
      });
      response = httpMocks.createResponse();
    });

    it('Return 200, if equipments successfully found with keywords', async () => {
      request.userId = faker.random.alphaNumeric(24);
      request.query.keywords = faker.random.words(2);
      const limit = request.query.limit as string;
      const skip = request.query.skip as string;
      const keywords = (request.query.keywords as string)?.split(' ').join('|');
      const condition = {
        type: new RegExp(`${keywords}`, 'gi'),
        brand: new RegExp(`${keywords}`, 'gi'),
        model: new RegExp(`${keywords}`, 'gi'),
      };

      const filter = Filter.parse({ limit, skip, condition });
      const equipments = [Equipment.parse({ userId: request.userId, ...fakeEquipment() })];
      equipmentRepository.findEquipments = jest.fn(() => equipments);

      await equipmentController.getEquipments(request, response);

      expect(equipmentRepository.findEquipments).toHaveBeenCalledWith(filter, true);
      expect(response._getJSONData()).toEqual({ equipments: equipments.map((score) => score.toJson()) });
      expect(response.statusCode).toBe(200);
    });

    it('Return 200, if equipments successfully found without keywords', async () => {
      request.userId = faker.random.alphaNumeric(24);
      request.query.type = faker.random.alpha(4);
      request.query.brand = faker.random.alpha(4);
      request.query.model = faker.random.alpha(4);
      const limit = request.query.limit as string;
      const skip = request.query.skip as string;
      const type = request.query.type as string;
      const brand = request.query.brand as string;
      const model = request.query.model as string;
      const condition = {
        type: new RegExp(`${type}`, 'gi'),
        brand: new RegExp(`${brand}`, 'gi'),
        model: new RegExp(`${model}`, 'gi'),
      };

      const filter = Filter.parse({ limit, skip, condition });
      const equipments = [Equipment.parse({ userId: request.userId, ...fakeEquipment() })];
      equipmentRepository.findEquipments = jest.fn(() => equipments);

      await equipmentController.getEquipments(request, response);

      expect(equipmentRepository.findEquipments).toHaveBeenCalledWith(filter, false);
      expect(response._getJSONData()).toEqual({ equipments: equipments.map((score) => score.toJson()) });
      expect(response.statusCode).toBe(200);
    });
  });

  describe('removeEquipment', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      request = httpMocks.createRequest({
        method: 'DELETE',
        url: `/equipment`,
      });
      response = httpMocks.createResponse();
    });

    it('Return 204, if equipment successfully removed', async () => {
      request.userId = faker.random.alphaNumeric(24);
      equipmentRepository.removeEquipment = jest.fn(() => Equipment.parse({ id: faker.random.alphaNumeric(24) }));

      await equipmentController.removeEquipment(request, response);

      expect(equipmentRepository.removeEquipment).toHaveBeenCalledWith(request.userId);
      expect(response.statusCode).toBe(204);
    });

    it('Return 404 if there is no registered score', async () => {
      request.userId = faker.random.alphaNumeric(24);
      equipmentRepository.removeEquipment = jest.fn(() => Equipment.parse(null));

      const removeEquipment = async () => equipmentController.removeEquipment(request, response);

      await expect(removeEquipment()).rejects.toStrictEqual(
        new FailureObject(ErrorCode.NOT_FOUND, 'Equipment not found', 404)
      );
      expect(equipmentRepository.removeEquipment).toHaveBeenCalledWith(request.userId);
    });
  });
});
