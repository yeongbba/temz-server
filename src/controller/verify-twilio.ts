import { Request, Response } from 'express';
import { Twilio } from 'twilio';
import { config } from '../config';

const client = new Twilio(config.twilio.accountSid, config.twilio.authToken);

export const sendVerificationToken = async (req: Request, res: Response) => {
  const { phoneNumber }: { phoneNumber: string } = req.body;
  const verification = await client.verify.v2
    .services(config.twilio.serviceSid)
    .verifications.create({ to: `+8210${phoneNumber.slice(-8)}`, channel: 'sms' });

  res.status(200).json({ sid: verification.sid });
};

export const checkVerificationToken = async (req: Request, res: Response) => {
  const { phoneNumber, code }: { phoneNumber: string; code: string } = req.body;

  const verificationCheck = await client.verify.v2
    .services(config.twilio.serviceSid)
    .verificationChecks.create({ to: `+8210${phoneNumber.slice(-8)}`, code });

  res.status(200).json({ status: verificationCheck.status });
};

export const cancelVerificationStatus = async (req: Request, res: Response) => {
  const { sid }: { sid: string } = req.body;
  await client.verify.v2.services(config.twilio.serviceSid).verifications(sid).update({ status: 'canceled' });

  res.status(201).send();
};

export const fetchVerificationInfo = async (req: Request, res: Response) => {
  const { sid }: { sid: string } = req.body;
  const verification = await client.verify.v2.services(config.twilio.serviceSid).verifications(sid).fetch();

  res.status(200).json(verification);
};
