import { Request, Response } from 'express';
import { config } from '../../config';
import { checkExistPhone, getVerifyCode, removeVerifyCode, setExpireTime, setVerifyCode } from '../data/verify';
import { ErrorCode } from '../types/error.util';
import { FailureObject } from '../util/error.util';
import { sendSMSMessage } from '../util/sms.util';

export const sendVerificationToken = async (req: Request, res: Response) => {
  const { phoneNumber }: { phoneNumber: string } = req.body;
  const code = generateCode();
  const smsData = {
    from: config.sens.hostPhone,
    content: 'temz verify code',
    messages: [
      {
        to: phoneNumber,
        subject: 'TEMZ 인증번호',
        content: `[TEMZ] 인증번호 [${code}]를 입력해주세요.`,
      },
    ],
  };

  const existedPhone = await checkExistPhone(phoneNumber);
  if (existedPhone) {
    const verificationToken = await getVerifyCode(phoneNumber);
    if (verificationToken.count > config.verification.allowCount) {
      await setExpireTime(phoneNumber, 600);
      const failure = new FailureObject(ErrorCode.TOO_MANY_REQUEST, 'Sent too many requests', 429);
      throw failure;
    } else {
      await setVerifyCode(phoneNumber, code, ++verificationToken.count);
    }
  } else {
    await setVerifyCode(phoneNumber, code, 1);
  }

  await setExpireTime(phoneNumber, 180);
  sendSMSMessage(smsData);
  res.sendStatus(200);
};

export const checkVerificationToken = async (req: Request, res: Response) => {
  const { phoneNumber, code }: { phoneNumber: string; code: number } = req.body;
  const verificationToken = await getVerifyCode(phoneNumber);
  const status = verificationToken.code === code;

  if (status) {
    await removeVerifyCode(phoneNumber);
  }

  res.status(200).json({ status });
};

export const cancelVerificationToken = async (req: Request, res: Response) => {
  const { phoneNumber }: { phoneNumber: string } = req.body;
  await removeVerifyCode(phoneNumber);
  res.sendStatus(201);
};

function generateCode() {
  const min = 100000;
  const max = 999999;
  const randomNum = Math.floor(Math.random() * (max - min + 1) + min);
  return randomNum;
}
