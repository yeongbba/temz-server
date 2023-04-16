import httpMocks from 'node-mocks-http';
import { faker } from '@faker-js/faker';
import { ErrorCode } from '../../types/error.util';
import { GeneralLinks, SocialLinks } from '../../types/link';
import { FailureObject } from '../../util/error.util';
import { fakeGeneralLinks, fakeSocialLinks } from '../../util/tests/link.util';
import { LinkController, THEME_MAX_COUNT } from '../link';

describe('Link Controller', () => {
  let linkController: LinkController;
  let linkRepository: any;

  beforeEach(() => {
    linkRepository = {};
    linkController = new LinkController(linkRepository);
  });

  describe('createSocialLinks', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const links = fakeSocialLinks(false);

      request = httpMocks.createRequest({
        method: 'POST',
        url: `/link/social`,
        body: links,
      });
      response = httpMocks.createResponse();
    });

    it('Return 409, if there is already a registered social links', async () => {
      request.userId = faker.random.alphaNumeric(24);
      linkRepository.findSocialLinksByUserId = jest.fn(() => SocialLinks.parse({ id: faker.random.alphaNumeric(24) }));

      const createSocialLinks = async () => linkController.createSocialLinks(request, response);

      await expect(createSocialLinks()).rejects.toStrictEqual(
        new FailureObject(ErrorCode.DUPLICATED_VALUE, `Social Links already exist`, 409)
      );
      expect(linkRepository.findSocialLinksByUserId).toHaveBeenCalledWith(request.userId);
    });

    it('Return 201, if social links is registered successfully', async () => {
      request.userId = faker.random.alphaNumeric(24);
      linkRepository.findSocialLinksByUserId = jest.fn(() => SocialLinks.parse(null));
      linkRepository.createSocialLinks = jest.fn();

      await linkController.createSocialLinks(request, response);

      expect(linkRepository.findSocialLinksByUserId).toHaveBeenCalledWith(request.userId);
      expect(linkRepository.createSocialLinks).toHaveBeenCalledWith(
        SocialLinks.parse({ userId: request.userId, ...request.body })
      );
      expect(response.statusCode).toBe(201);
    });
  });

  describe('updateSocialLinks', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const links = SocialLinks.parse(fakeSocialLinks()).toJson();

      request = httpMocks.createRequest({
        method: 'PUT',
        url: `/link/social`,
        body: links,
      });
      response = httpMocks.createResponse();
    });

    it('Return 404 if there is no registered social links', async () => {
      request.userId = faker.random.alphaNumeric(24);
      linkRepository.updateSocialLinks = jest.fn(() => SocialLinks.parse(null));

      const updateSocialLinks = async () => linkController.updateSocialLinks(request, response);

      await expect(updateSocialLinks()).rejects.toStrictEqual(
        new FailureObject(ErrorCode.NOT_FOUND, 'Social Links not found', 404)
      );
      expect(linkRepository.updateSocialLinks).toHaveBeenCalledWith({ userId: request.userId, ...request.body });
    });

    it('Return 204, if social link is updated successfully', async () => {
      request.userId = faker.random.alphaNumeric(24);
      linkRepository.updateSocialLinks = jest.fn(() => SocialLinks.parse({ id: faker.random.alphaNumeric(24) }));

      await linkController.updateSocialLinks(request, response);

      expect(linkRepository.updateSocialLinks).toHaveBeenCalledWith({ userId: request.userId, ...request.body });
      expect(response.statusCode).toBe(204);
    });
  });

  describe('getSocialLinks', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      request = httpMocks.createRequest({
        method: 'GET',
        url: `/link/social`,
      });
      response = httpMocks.createResponse();
    });

    it('Return 200, if social link successfully found', async () => {
      request.userId = faker.random.alphaNumeric(24);
      const socialLinks = SocialLinks.parse({ userId: request.userId, ...fakeSocialLinks() });
      linkRepository.findSocialLinksByUserId = jest.fn(() => socialLinks);

      await linkController.getSocialLinks(request, response);

      expect(linkRepository.findSocialLinksByUserId).toHaveBeenCalledWith(request.userId);
      expect(response._getJSONData()).toEqual(socialLinks.toJson());
      expect(response.statusCode).toBe(200);
    });
  });

  describe('createGeneralLinks', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const links = fakeGeneralLinks(false);

      request = httpMocks.createRequest({
        method: 'POST',
        url: `/link/general`,
        body: links,
      });
      response = httpMocks.createResponse();
    });

    it('Return 406, if the link is created as much as the limit', async () => {
      request.userId = faker.random.alphaNumeric(24);
      linkRepository.findThemesByUserId = jest.fn(() =>
        new Array(THEME_MAX_COUNT).fill(GeneralLinks.parse({ id: faker.random.alphaNumeric(24) }))
      );

      const createGeneralLinks = async () => linkController.createGeneralLinks(request, response);

      await expect(createGeneralLinks()).rejects.toStrictEqual(
        new FailureObject(ErrorCode.NOT_ACCEPTABLE, `${THEME_MAX_COUNT} themes have already been created.`, 406)
      );
      expect(linkRepository.findThemesByUserId).toHaveBeenCalledWith(request.userId);
    });

    it('Return 201, if social links is registered successfully', async () => {
      request.userId = faker.random.alphaNumeric(24);
      linkRepository.findThemesByUserId = jest.fn(() => []);
      linkRepository.createGeneralLinks = jest.fn();

      await linkController.createGeneralLinks(request, response);

      expect(linkRepository.findThemesByUserId).toHaveBeenCalledWith(request.userId);
      expect(linkRepository.createGeneralLinks).toHaveBeenCalledWith(
        GeneralLinks.parse({ userId: request.userId, ...request.body })
      );
      expect(response.statusCode).toBe(201);
    });
  });

  describe('updateGeneralLinks', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const links = GeneralLinks.parse(fakeGeneralLinks()).toJson();

      request = httpMocks.createRequest({
        method: 'PUT',
        url: `/link/general`,
        body: links,
      });
      response = httpMocks.createResponse();
    });

    it('Return 404 if there is no registered general links', async () => {
      request.userId = faker.random.alphaNumeric(24);
      linkRepository.updateGeneralLinks = jest.fn(() => GeneralLinks.parse(null));

      const updateGeneralLinks = async () => linkController.updateGeneralLinks(request, response);

      await expect(updateGeneralLinks()).rejects.toStrictEqual(
        new FailureObject(ErrorCode.NOT_FOUND, 'General Links not found', 404)
      );
      expect(linkRepository.updateGeneralLinks).toHaveBeenCalledWith({ userId: request.userId, ...request.body });
    });

    it('Return 204, if general link is updated successfully', async () => {
      request.userId = faker.random.alphaNumeric(24);
      linkRepository.updateGeneralLinks = jest.fn(() =>
        GeneralLinks.parse({ id: request.body.linkId, ...request.body })
      );

      await linkController.updateGeneralLinks(request, response);

      expect(linkRepository.updateGeneralLinks).toHaveBeenCalledWith({ userId: request.userId, ...request.body });
      expect(response.statusCode).toBe(204);
    });
  });

  describe('getThemes', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      request = httpMocks.createRequest({
        method: 'GET',
        url: `/link/general`,
      });
      response = httpMocks.createResponse();
    });

    it('Return 200, if general link successfully found', async () => {
      request.userId = faker.random.alphaNumeric(24);
      const themes = [GeneralLinks.parse({ userId: request.userId, ...fakeGeneralLinks() })];
      linkRepository.findThemesByUserId = jest.fn(() => themes);

      await linkController.getThemes(request, response);

      expect(linkRepository.findThemesByUserId).toHaveBeenCalledWith(request.userId);
      expect(response._getJSONData()).toEqual({ themes: themes.map((theme) => theme.toJson()) });
      expect(response.statusCode).toBe(200);
    });
  });

  describe('removeGeneralLinks', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const links = fakeGeneralLinks();

      request = httpMocks.createRequest({
        method: 'DELETE',
        url: `/link/general`,
        query: { linkId: links.id },
      });
      response = httpMocks.createResponse();
    });

    it('Return 204, if general link successfully removed', async () => {
      const linkId = request.query.linkId;
      linkRepository.removeGeneralLinks = jest.fn(() => GeneralLinks.parse({ id: linkId }));

      await linkController.removeGeneralLinks(request, response);

      expect(linkRepository.removeGeneralLinks).toHaveBeenCalledWith(linkId);
      expect(response.statusCode).toBe(204);
    });

    it('Return 404 if there is no registered general links', async () => {
      const linkId = request.query.linkId;
      linkRepository.removeGeneralLinks = jest.fn(() => GeneralLinks.parse(null));

      const removeGeneralLinks = async () => linkController.removeGeneralLinks(request, response);

      await expect(removeGeneralLinks()).rejects.toStrictEqual(
        new FailureObject(ErrorCode.NOT_FOUND, 'General Links not found', 404)
      );
      expect(linkRepository.removeGeneralLinks).toHaveBeenCalledWith(linkId);
    });
  });
});
