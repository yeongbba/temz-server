import { Request, Response } from 'express';
import { config } from '../config';
import { ErrorCode } from '../types/error.util';
import { FailureObject } from '../util/error.util';
import { sendSMSMessage } from '../util/sms.util';

export class VerifyController {
  constructor(private verifyRepository: any) {}

  sendVerificationToken = async (req: Request, res: Response) => {
    const { phone }: { phone: string } = req.body;
    const code = this.generateCode();
    const smsData = {
      from: config.sens.hostPhone,
      content: 'temz verify code',
      messages: [
        {
          to: phone,
          subject: 'TEMZ 인증번호',
          content: `[TEMZ] 인증번호 [${code}]를 입력해주세요.`,
        },
      ],
    };

    const existedPhone = await this.verifyRepository.checkExistPhone(phone);
    if (existedPhone) {
      const verificationToken = await this.verifyRepository.getVerifyCode(phone);
      if (verificationToken.count > config.verification.allowCount) {
        await this.verifyRepository.setExpireTime(phone, 600);
        const failure = new FailureObject(ErrorCode.TOO_MANY_REQUEST, 'Sent too many requests', 429);
        throw failure;
      } else {
        await this.verifyRepository.setVerifyCode(phone, code, ++verificationToken.count);
      }
    } else {
      await this.verifyRepository.setVerifyCode(phone, code, 1);
    }

    await this.verifyRepository.setExpireTime(phone, 180);
    await sendSMSMessage(smsData);
    res.sendStatus(200);
  };

  checkVerificationToken = async (req: Request, res: Response) => {
    const { phone, code }: { phone: string; code: number } = req.body;
    const verificationToken = await this.verifyRepository.getVerifyCode(phone);
    const status = verificationToken.code === code;

    if (status) {
      await this.verifyRepository.removeVerifyCode(phone);
    }

    res.status(200).json({ status });
  };

  cancelVerificationToken = async (req: Request, res: Response) => {
    const { phone }: { phone: string } = req.body;
    await this.verifyRepository.removeVerifyCode(phone);
    res.sendStatus(201);
  };

  private generateCode() {
    const min = 100000;
    const max = 999999;
    const randomNum = Math.floor(Math.random() * (max - min + 1) + min);
    return randomNum;
  }
}
