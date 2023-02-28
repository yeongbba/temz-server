import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as userRepository from '../data/auth';
import { config } from '../../config';
import { CookieOptions, Request, Response } from 'express';
import { FailureObject } from '../util/error.util';
import { ErrorCode } from '../types/error.util';

export async function signup(req: Request, res: Response) {
  const { name, password, email, phone, profile, wallet } = req.body;

  const found = await userRepository.findByName(name);
  if (found) {
    const failure = new FailureObject(ErrorCode.DUPLICATED_VALUE, `${name} already exists`, 409);
    throw failure;
  }

  const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
  await userRepository.createUser({
    name,
    password: hashed,
    profile,
    email,
    phone,
    wallet,
  });
  res.sendStatus(201);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await userRepository.findByEmail(email);
  user.password = null;
  const failure = new FailureObject(ErrorCode.INVALID_VALUE, 'Invalid user or password', 401);
  if (user) {
    throw failure;
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw failure;
  }
  const token = createJwtToken(user.id);
  setToken(res, token);
  res.status(200).json({ token, user });
}

export async function logout(req: Request, res: Response) {
  res.cookie('token', '');
  res.sendStatus(200);
}

export async function me(req: Request, res: Response) {
  const user = await userRepository.findById((req as any).userId);
  if (!user) {
    const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
    throw failure;
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
  const user = await userRepository.findByName(nickname);
  res.status(200).json({ isValid: !user });
}

// TODO: 필요한지 체크.
export async function checkWallet(req: Request, res: Response) {
  const { wallet } = req.body;
  const user = await userRepository.findByWallet(wallet);
  res.status(200).json({ isValid: !user });
}

function createJwtToken(id: string) {
  return jwt.sign({ id }, config.jwt.secretKey, {
    expiresIn: config.jwt.expiresInSec,
  });
}

function setToken(res: Response, token: string) {
  const options: CookieOptions = {
    maxAge: config.jwt.expiresInSec * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  };
  res.cookie('token', token, options);
}

export async function csrf(req: Request, res: Response) {
  const token = await generateCSRFToken();
  res.status(200).json({ token });
}

async function generateCSRFToken() {
  return bcrypt.hash(config.csrf.plainToken, 1);
}

// 휴면 계정 안내 이메일 전송?

// remove user
// update user
