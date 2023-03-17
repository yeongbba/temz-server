import index from '../index';
import { VerificationToken, VerificationTokenKeys } from '../types/verify';

export async function setVerifyCode(phone: string, code: number, count: number) {
  const redisClient = index.verifyCodeDB.client;
  await redisClient.hSet(phone, VerificationTokenKeys.CODE, code);
  await redisClient.hSet(phone, VerificationTokenKeys.COUNT, count);
}

export async function getVerifyCode(phone: string) {
  const redisClient = index.verifyCodeDB.client;
  const result = await redisClient.hGetAll(phone);
  return VerificationToken.parse(result);
}

export async function checkExistPhone(phone: string) {
  const redisClient = index.verifyCodeDB.client;
  const result = await redisClient.exists(phone);
  return !!result;
}

export async function setExpireTime(phone: string, seconds: number) {
  const redisClient = index.verifyCodeDB.client;
  await redisClient.expire(phone, seconds);
}

export async function removeVerifyCode(phone: string) {
  const redisClient = index.verifyCodeDB.client;
  await redisClient.del(phone);
}
