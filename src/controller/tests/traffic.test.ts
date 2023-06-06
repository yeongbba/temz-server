import httpMocks from 'node-mocks-http';
import { faker } from '@faker-js/faker';
import { ErrorCode } from '../../types/error.util';
import { FailureObject } from '../../util/error.util';
import { TrafficController } from '../traffic';
import { TotalTraffic, Traffic } from '../../types/traffic';
import { fakeTraffic, fakeTotalTraffic } from '../../util/tests/traffic.util';

describe('Traffic Controller', () => {
  let trafficController: TrafficController;
  let trafficRepository: any;

  beforeEach(() => {
    trafficRepository = {};
    trafficController = new TrafficController(trafficRepository);
  });

  describe('createTraffic', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const traffic = Traffic.parse(fakeTraffic(false)).toJson();

      request = httpMocks.createRequest({
        method: 'POST',
        url: `/traffic`,
        body: traffic,
      });
      response = httpMocks.createResponse();
    });

    it('Return 201, if traffic is created successfully', async () => {
      request.userId = faker.random.alphaNumeric(24);
      trafficRepository.createTraffic = jest.fn();

      await trafficController.createTraffic(request, response);

      expect(trafficRepository.createTraffic).toHaveBeenCalledWith(
        Traffic.parse({ userId: request.userId, ...request.body })
      );
      expect(response.statusCode).toBe(201);
    });
  });

  describe('updateTraffic', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const traffic = Traffic.parse(fakeTraffic(false)).toJson();

      request = httpMocks.createRequest({
        method: 'PUT',
        url: `/traffic`,
        body: traffic,
      });
      response = httpMocks.createResponse();
    });

    it('Return 404 if there is no registered traffic', async () => {
      request.userId = faker.random.alphaNumeric(24);
      trafficRepository.updateTraffic = jest.fn(() => Traffic.parse(null));

      const updateTraffic = async () => trafficController.updateTraffic(request, response);

      await expect(updateTraffic()).rejects.toStrictEqual(
        new FailureObject(ErrorCode.NOT_FOUND, 'Traffic not found', 404)
      );
      expect(trafficRepository.updateTraffic).toHaveBeenCalledWith({ userId: request.userId, ...request.body });
    });

    it('Return 204, if traffic is updated successfully', async () => {
      request.userId = faker.random.alphaNumeric(24);
      trafficRepository.updateTraffic = jest.fn(() => Traffic.parse({ id: faker.random.alphaNumeric(24) }));

      await trafficController.updateTraffic(request, response);

      expect(trafficRepository.updateTraffic).toHaveBeenCalledWith({ userId: request.userId, ...request.body });
      expect(response.statusCode).toBe(204);
    });
  });

  describe('getTraffic', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      request = httpMocks.createRequest({
        method: 'GET',
        url: `/traffic`,
        query: {
          date: '2023-05-23',
        },
      });
      response = httpMocks.createResponse();
    });

    it('Return 200, if traffic successfully found', async () => {
      request.userId = faker.random.alphaNumeric(24);
      const date = request.query.date as string;
      const traffic = Traffic.parse({ userId: request.userId, date });
      trafficRepository.findTraffic = jest.fn(() => traffic);

      await trafficController.getTraffic(request, response);

      expect(trafficRepository.findTraffic).toHaveBeenCalledWith(traffic);
      expect(response._getJSONData()).toEqual(traffic.toJson());
      expect(response.statusCode).toBe(200);
    });
  });

  describe('getTotalTraffic', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      request = httpMocks.createRequest({
        method: 'GET',
        url: `/traffic/total`,
      });
      response = httpMocks.createResponse();
    });

    it('Return 200, if total traffic successfully found', async () => {
      request.userId = faker.random.alphaNumeric(24);
      const total = TotalTraffic.parse({ ...fakeTotalTraffic(false) });
      trafficRepository.findTotalTraffic = jest.fn(() => total);

      await trafficController.getTotalTraffic(request, response);

      expect(trafficRepository.findTotalTraffic).toHaveBeenCalledWith((request as any).userId);
      expect(response._getJSONData()).toEqual(total.toJson());
      expect(response.statusCode).toBe(200);
    });
  });
});
