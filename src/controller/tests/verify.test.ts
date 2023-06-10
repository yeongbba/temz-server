import httpMocks from 'node-mocks-http';
import { faker } from '@faker-js/faker';
import { FailureObject } from '../../util/error.util';
import { ErrorCode } from '../../types/error.util';
import { config } from '../../config';
import { VerifyController } from '../verify';
import { generatePhoneNumber } from '../../util/tests/verify.util';
import verifyUtil from '../../util/sms.util';

jest.mock('../../util/sms.util');

describe('Verify Controller', () => {
  let verifyController: VerifyController;
  let verifyRepository: any;

  beforeEach(() => {
    verifyRepository = {};
    verifyController = new VerifyController(verifyRepository);
  });

  describe('sendVerificationToken', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const phone = generatePhoneNumber();

      request = httpMocks.createRequest({
        method: 'POST',
        url: `/verify/token`,
        body: {
          phone,
        },
      });
      response = httpMocks.createResponse();
    });

    it('If the api is called more than allowCount in a row, return 429', async () => {
      const code = parseInt(faker.string.numeric(6));
      verifyUtil.generateCode = jest.fn(() => code);
      verifyRepository.checkExistPhone = jest.fn(() => true);
      verifyRepository.getVerifyCode = jest.fn(() => ({ code, count: config.verification.allowCount + 1 }));
      verifyRepository.setExpireTime = jest.fn();

      const sendVerificationToken = async () => verifyController.sendVerificationToken(request, response);

      await expect(sendVerificationToken()).rejects.toStrictEqual(
        new FailureObject(ErrorCode.TOO_MANY_REQUEST, 'Sent too many requests', 429)
      );

      expect(verifyUtil.generateCode).toHaveBeenCalled();
      expect(verifyRepository.checkExistPhone).toHaveBeenCalledWith(request.body.phone);
      expect(verifyRepository.getVerifyCode).toHaveBeenCalledWith(request.body.phone);
      expect(verifyRepository.setExpireTime).toHaveBeenCalledWith(
        request.body.phone,
        config.verification.blockExpireMinute
      );
    });

    it('If the api called again but send the sms successfully, return 200', async () => {
      const phone = request.body.phone;
      const code = parseInt(faker.string.numeric(6));
      const count = config.verification.allowCount - 1;
      verifyUtil.generateCode = jest.fn(() => code);
      verifyUtil.sendSMSMessage = jest.fn();
      verifyRepository.checkExistPhone = jest.fn(() => true);
      verifyRepository.getVerifyCode = jest.fn(() => ({ code, count }));
      verifyRepository.setVerifyCode = jest.fn();
      verifyRepository.setExpireTime = jest.fn();

      await verifyController.sendVerificationToken(request, response);

      expect(verifyUtil.generateCode).toHaveBeenCalled();
      expect(verifyRepository.checkExistPhone).toHaveBeenCalledWith(phone);
      expect(verifyRepository.getVerifyCode).toHaveBeenCalledWith(phone);
      expect(verifyRepository.setVerifyCode).toHaveBeenCalledWith(phone, code, count + 1);
      expect(verifyRepository.setExpireTime).toHaveBeenCalledWith(phone, config.verification.generalExpireMinute);
      expect(verifyUtil.sendSMSMessage).toHaveBeenCalledWith({
        from: config.sens.hostPhone,
        content: 'temz verify code',
        messages: [
          {
            to: phone,
            subject: 'TEMZ 인증번호',
            content: `[TEMZ] 인증번호 [${code}]를 입력해주세요.`,
          },
        ],
      });
      expect(response.statusCode).toBe(200);
    });

    it('If the api called first time and send the sms successfully, return 200', async () => {
      const phone = request.body.phone;
      const code = parseInt(faker.string.numeric(6));
      verifyUtil.generateCode = jest.fn(() => code);
      verifyUtil.sendSMSMessage = jest.fn();
      verifyRepository.checkExistPhone = jest.fn();
      verifyRepository.setVerifyCode = jest.fn();
      verifyRepository.setExpireTime = jest.fn();

      await verifyController.sendVerificationToken(request, response);

      expect(verifyUtil.generateCode).toHaveBeenCalled();
      expect(verifyRepository.checkExistPhone).toHaveBeenCalledWith(phone);
      expect(verifyRepository.setVerifyCode).toHaveBeenCalledWith(phone, code, 1);
      expect(verifyRepository.setExpireTime).toHaveBeenCalledWith(phone, config.verification.generalExpireMinute);
      expect(verifyUtil.sendSMSMessage).toHaveBeenCalledWith({
        from: config.sens.hostPhone,
        content: 'temz verify code',
        messages: [
          {
            to: phone,
            subject: 'TEMZ 인증번호',
            content: `[TEMZ] 인증번호 [${code}]를 입력해주세요.`,
          },
        ],
      });
      expect(response.statusCode).toBe(200);
    });
  });

  describe('checkVerificationToken', () => {
    let code: string;
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const phone = generatePhoneNumber();
      code = faker.string.numeric(6);

      request = httpMocks.createRequest({
        method: 'POST',
        url: `/verify/check`,
        body: {
          phone,
          code,
        },
      });
      response = httpMocks.createResponse();
    });

    it('Return status value true with 200 if code verification is successful', async () => {
      verifyRepository.getVerifyCode = jest.fn(() => ({ code }));
      verifyRepository.removeVerifyCode = jest.fn();

      await verifyController.checkVerificationToken(request, response);

      expect(verifyRepository.getVerifyCode).toHaveBeenCalledWith(request.body.phone);
      expect(verifyRepository.removeVerifyCode).toHaveBeenCalledWith(request.body.phone);
      expect(response._getJSONData()).toEqual({ status: true });
      expect(response.statusCode).toBe(200);
    });

    it('Return status value false with 200 if code verification is fail', async () => {
      const fakeCode = faker.string.numeric(6);
      verifyRepository.getVerifyCode = jest.fn(() => ({ code: fakeCode }));

      await verifyController.checkVerificationToken(request, response);

      expect(verifyRepository.getVerifyCode).toHaveBeenCalledWith(request.body.phone);
      expect(response._getJSONData()).toEqual({ status: false });
      expect(response.statusCode).toBe(200);
    });
  });

  describe('cancelVerificationToken', () => {
    let request = httpMocks.createRequest();
    let response = httpMocks.createResponse();

    beforeEach(() => {
      const phone = generatePhoneNumber();

      request = httpMocks.createRequest({
        method: 'POST',
        url: `/verify/cancel`,
        body: {
          phone,
        },
      });
      response = httpMocks.createResponse();
    });

    it('Return 201 if successfully canceling code verification', async () => {
      verifyRepository.removeVerifyCode = jest.fn();

      await verifyController.cancelVerificationToken(request, response);

      expect(verifyRepository.removeVerifyCode).toHaveBeenCalledWith(request.body.phone);
      expect(response.statusCode).toBe(201);
    });
  });
});
