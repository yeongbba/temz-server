import httpMocks from 'node-mocks-http';
import { faker } from '@faker-js/faker';
import { ErrorCode } from '../../types/error.util';
import { Links } from '../../types/link';
import { FailureObject } from '../../util/error.util';
import { fakeLinks } from '../../util/tests/link.util';
import { LinkController } from '../link';

describe('Link Controller', () => {
  let linkController: LinkController;
  let linkRepository: any;

  beforeEach(() => {
    linkRepository = {};
    linkController = new LinkController(linkRepository);
  });

  describe('createLinks', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const links = fakeLinks(false);

      request = httpMocks.createRequest({
        method: 'POST',
        url: `/link`,
        body: {
          links,
        },
      });
      response = httpMocks.createResponse();
    });

    it('Return 409, if there is already a registered link', async () => {
      request.userId = faker.random.alphaNumeric(24);
      linkRepository.findLinksByUserId = jest.fn(() => Links.parse({ id: faker.random.alphaNumeric(24) }));

      const createLinks = async () => linkController.createLinks(request, response);

      await expect(createLinks()).rejects.toStrictEqual(
        new FailureObject(ErrorCode.DUPLICATED_VALUE, `Links already exist`, 409)
      );
      expect(linkRepository.findLinksByUserId).toHaveBeenCalledWith(request.userId);
    });

    it('Return 201, if link is registered successfully', async () => {
      request.userId = faker.random.alphaNumeric(24);
      linkRepository.findLinksByUserId = jest.fn(() => Links.parse(null));
      linkRepository.createLinks = jest.fn();

      await linkController.createLinks(request, response);

      expect(linkRepository.findLinksByUserId).toHaveBeenCalledWith(request.userId);
      expect(linkRepository.createLinks).toHaveBeenCalledWith(
        Links.parse({ userId: request.userId, ...request.body.links })
      );
      expect(response.statusCode).toBe(201);
    });
  });

  describe('updateLinks', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const links = fakeLinks(false);

      request = httpMocks.createRequest({
        method: 'PUT',
        url: `/link`,
        body: {
          links,
        },
      });
      response = httpMocks.createResponse();
    });

    it('Return 404 if there is no registered link', async () => {
      request.userId = faker.random.alphaNumeric(24);
      linkRepository.updateLinks = jest.fn(() => Links.parse(null));

      const updateLinks = async () => linkController.updateLinks(request, response);

      await expect(updateLinks()).rejects.toStrictEqual(new FailureObject(ErrorCode.NOT_FOUND, 'Links not found', 404));
      expect(linkRepository.updateLinks).toHaveBeenCalledWith(
        Links.parse({ userId: request.userId, ...request.body.links })
      );
    });

    it('Return 204, if link is updated successfully', async () => {
      request.userId = faker.random.alphaNumeric(24);
      linkRepository.updateLinks = jest.fn(() => Links.parse({ id: faker.random.alphaNumeric(24) }));

      await linkController.updateLinks(request, response);

      expect(linkRepository.updateLinks).toHaveBeenCalledWith(
        Links.parse({ userId: request.userId, ...request.body.links })
      );
      expect(response.statusCode).toBe(204);
    });
  });

  describe('getLinks', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      request = httpMocks.createRequest({
        method: 'GET',
        url: `/link`,
      });
      response = httpMocks.createResponse();
    });

    it('Return 200, if link successfully found', async () => {
      request.userId = faker.random.alphaNumeric(24);
      const links = Links.parse({ userId: request.userId, ...fakeLinks() });
      linkRepository.findLinksByUserId = jest.fn(() => links);

      await linkController.getLinks(request, response);

      expect(linkRepository.findLinksByUserId).toHaveBeenCalledWith(request.userId);
      expect(response._getJSONData()).toEqual({
        links: links.toJson(),
      });
      expect(response.statusCode).toBe(200);
    });
  });
});
