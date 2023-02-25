import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as userRepository from '../data/auth';
import { config } from '../../config';
import { Request, Response } from 'express';
import { FailureObject } from '../util/error.util';
import { ErrorCode } from 'util';

export async function signup(req: Request, res: Response) {
  const { nickname, password, email, phone, domain, profile, wallet } = req.body;
  const found = await userRepository.findByNickname(nickname);
  if (found) {
    const failure = new FailureObject(ErrorCode.DUPLICATED_VALUE, `${nickname} already exists`);
    return res.status(409).json(failure);
  }
  const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
  const userId = await userRepository.createUser({
    nickname,
    password: hashed,
    profile,
    email,
    phone,
    domain,
    wallet,
  });
  const token = createJwtToken(userId);
  res.status(201).json({ token });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await userRepository.findByEmail(email);
  const failure = new FailureObject(ErrorCode.INVALID_VALUE, 'Invalid user or password');
  if (user) {
    return res.status(401).json(failure);
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json(failure);
  }
  const token = createJwtToken(user.id);
  user.password = null;
  res.status(200).json({ token, user });
}

function createJwtToken(id: string) {
  return jwt.sign({ id }, config.jwt.secretKey, {
    expiresIn: config.jwt.expiresInSec,
  });
}

export async function me(req: Request, res: Response) {
  const user = await userRepository.findById((req as any).userId);
  if (!user) {
    const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found');
    return res.status(404).json(failure);
  }
  user.password = null;
  res.status(200).json({ token: (req as any).token, user });
}

export async function checkEmail(req: Request, res: Response) {
  const { email } = req.body;
  const user = await userRepository.findByEmail(email);
  res.status(200).json({ isValid: !user });
}

export async function checkNickname(req: Request, res: Response) {
  const { nickname } = req.body;
  const user = await userRepository.findByNickname(nickname);
  res.status(200).json({ isValid: !user });
}

export async function checkDomain(req: Request, res: Response) {
  const { domain } = req.body;
  const user = await userRepository.findByDomain(domain);
  res.status(200).json({ isValid: !user });
}

// TODO: 필요한지 체크.
export async function checkWallet(req: Request, res: Response) {
  const { wallet } = req.body;
  const user = await userRepository.findByDomain(wallet);
  res.status(200).json({ isValid: !user });
}

// 휴면 계정 안내 이메일 전송?

// remove user
// update user
