import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validator';
import * as verifyController from '../controller/verify';

const router = express.Router();

const validatePhoneNumber = [
  body('phoneNumber').trim().notEmpty().withMessage('Phone number is missing'),
  body('phoneNumber')
    .trim()
    .isMobilePhone('ko-KR' as any) // MobilePhoneLocale 타입으로 인지를 못함.
    .withMessage('Phone number should be consist of 11 digits'),
  validate,
];

const validateCode = [
  body('code').notEmpty().withMessage('Code is missing'),
  body('code').trim().isLength({ min: 6, max: 6 }).withMessage('Invalid code'),
  validate,
];

const validateCheckVerification = [...validatePhoneNumber, ...validateCode, validate];
const validateCancel = [body('sid').notEmpty().withMessage('Verification id is missing'), validate];

router.post('/token', validatePhoneNumber, verifyController.sendVerificationToken);

router.post('/check', validateCheckVerification, verifyController.checkVerificationToken);

router.put('/cancel', validateCancel, verifyController.cancelVerificationStatus);

router.post('/fetch', validateCancel, verifyController.fetchVerificationInfo);

export default router;
