import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as userRepository from '../data/auth';
import { config } from '../../config';
import { CookieOptions, Request, Response } from 'express';
import { FailureObject } from '../util/error.util';
import { ErrorCode } from '../types/error.util';
import { User } from '../types/auth';

export async function signup(req: Request, res: Response) {
  const { name, password, email, phone, profile, wallet } = req.body;

  const userByName = await userRepository.findByName(name);
  if (userByName) {
    const failure = new FailureObject(ErrorCode.DUPLICATED_VALUE, `${name} already exists`, 409);
    throw failure;
  }

  const userByPhone = await userRepository.findByPhone(phone);
  if (userByPhone) {
    userByPhone.phone = null;
    await userRepository.updateUser(userByPhone.userId, userByPhone);
  }

  const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
  const data = User.parse({
    name,
    password: hashed,
    profile,
    email,
    phone,
    wallet,
  });
  await userRepository.createUser(data);
  res.sendStatus(201);
}

export async function login(req: Request, res: Response) {
  const { name, password } = req.body;
  const user = await userRepository.findByName(name);

  const failure = new FailureObject(ErrorCode.INVALID_VALUE, 'Invalid user or password', 401);
  if (!user) {
    throw failure;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw failure;
  }

  if (!user.phone) {
    const failure = new FailureObject(ErrorCode.NOT_FOUND, 'Phone number was not found', 404);
    throw failure;
  }

  const token = createJwtToken(user.userId);
  setToken(res, token);
  delete user.password;
  delete user.userId;
  res.status(200).json({ token, user });
}

export async function update(req: Request, res: Response) {
  const { profile, email, phone, wallet } = req.body;
  const data = User.parse({
    profile,
    email,
    phone,
    wallet,
  });

  await userRepository.updateUser((req as any).userId, data);
  res.sendStatus(201);
}

export async function logout(req: Request, res: Response) {
  removeToken(res);
  res.sendStatus(201);
}

export async function remove(req: Request, res: Response) {
  await userRepository.removeUser((req as any).userId);
  removeToken(res);
  res.sendStatus(201);
}

export async function me(req: Request, res: Response) {
  const user = await userRepository.findById((req as any).userId);
  delete user.password;
  delete user.userId;
  res.status(200).json({ user });
}

export async function findName(req: Request, res: Response) {
  const { phone } = req.body;
  const user = await userRepository.findByPhone(phone);
  if (!user) {
    const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
    throw failure;
  }
  res.status(200).json({ name: user.name });
}

export async function resetPassword(req: Request, res: Response) {
  const { name, password } = req.body;

  const user = await userRepository.findByName(name);
  if (!user) {
    const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
    throw failure;
  }

  user.password = await bcrypt.hash(password, config.bcrypt.saltRounds);
  await userRepository.updateUser(user.userId, user);
  res.sendStatus(201);
}

export async function checkPhone(req: Request, res: Response) {
  const { name, phone } = req.body;
  const user = await userRepository.findByPhone(phone);
  if (!user) {
    const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
    throw failure;
  }

  if (user.name !== name) {
    const failure = new FailureObject(ErrorCode.INVALID_VALUE, 'Name does not match the owner of the phone', 400);
    throw failure;
  }

  res.sendStatus(200);
}

export async function checkName(req: Request, res: Response) {
  const name = req.query.name as string;
  const user = await userRepository.findByName(name);
  res.status(200).json({ isValid: !user });
}

// TODO: write on auth.yaml later..
export async function checkWallet(req: Request, res: Response) {
  const wallet = req.query.wallet as string;
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
  res.cookie('TEMZ_TOKEN', token, options);
}

export async function csrf(req: Request, res: Response) {
  const token = await generateCSRFToken();
  res.status(200).json({ token });
}

async function generateCSRFToken() {
  return bcrypt.hash(config.csrf.plainToken, 1);
}

function removeToken(res: Response) {
  res.cookie('TEMZ_TOKEN', '');
}
// 휴면 계정 안내 이메일 전송?
