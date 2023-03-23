import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config';
import { CookieOptions, Request, Response } from 'express';
import { FailureObject } from '../util/error.util';
import { ErrorCode } from '../types/error.util';
import { User } from '../types/auth';

export class AuthController {
  constructor(private userRepository: any) {}

  checkName = async (req: Request, res: Response) => {
    const name = req.query.name as string;
    const user = await this.userRepository.findByName(name);
    res.status(200).json({ isValid: !user });
  };

  me = async (req: Request, res: Response) => {
    const user = await this.userRepository.findById((req as any).userId);
    delete user.password;
    delete user.userId;
    res.status(200).json({ user });
  };

  csrf = async (req: Request, res: Response) => {
    const token = await this.generateCSRFToken();
    res.status(200).json({ token });
  };

  signup = async (req: Request, res: Response) => {
    const { name, password, email, phone, profile, wallet } = req.body;

    const userByName = await this.userRepository.findByName(name);
    if (userByName) {
      const failure = new FailureObject(ErrorCode.DUPLICATED_VALUE, `${name} already exists`, 409);
      throw failure;
    }

    const userByPhone = await this.userRepository.findByPhone(phone);
    if (userByPhone) {
      userByPhone.phone = null;
      await this.userRepository.updateUser(userByPhone.userId, userByPhone);
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
    await this.userRepository.createUser(data);
    res.sendStatus(201);
  };

  login = async (req: Request, res: Response) => {
    const { name, password } = req.body;
    const user = await this.userRepository.findByName(name);

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

    const token = this.createJwtToken(user.userId);
    this.setToken(res, token);
    delete user.password;
    delete user.userId;
    res.status(201).json({ token, user });
  };

  findName = async (req: Request, res: Response) => {
    const { phone } = req.body;
    const user = await this.userRepository.findByPhone(phone);
    if (!user) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
      throw failure;
    }
    res.status(200).json({ name: user.name });
  };

  resetPassword = async (req: Request, res: Response) => {
    const { name, password } = req.body;

    const user = await this.userRepository.findByName(name);
    if (!user) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
      throw failure;
    }

    user.password = await bcrypt.hash(password, config.bcrypt.saltRounds);
    await this.userRepository.updateUser(user.userId, user);
    res.sendStatus(201);
  };

  checkPhone = async (req: Request, res: Response) => {
    const { name, phone } = req.body;
    const user = await this.userRepository.findByPhone(phone);
    if (!user) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
      throw failure;
    }

    if (user.name !== name) {
      const failure = new FailureObject(ErrorCode.INVALID_VALUE, 'Name does not match the owner of the phone', 400);
      throw failure;
    }

    res.sendStatus(200);
  };

  logout = (req: Request, res: Response) => {
    this.removeToken(res);
    res.sendStatus(201);
  };

  update = async (req: Request, res: Response) => {
    const { profile, email, phone, wallet } = req.body;
    const data = User.parse({
      profile,
      email,
      phone,
      wallet,
    });

    await this.userRepository.updateUser((req as any).userId, data);
    res.sendStatus(201);
  };

  remove = async (req: Request, res: Response) => {
    await this.userRepository.removeUser((req as any).userId);
    this.removeToken(res);
    res.sendStatus(201);
  };

  // TODO: write on auth.yaml later..
  checkWallet = async (req: Request, res: Response) => {
    const wallet = req.query.wallet as string;
    const user = await this.userRepository.findByWallet(wallet);
    res.status(200).json({ isValid: !user });
  };

  private createJwtToken = (id: string) => {
    return jwt.sign({ id }, config.jwt.secretKey, {
      expiresIn: config.jwt.expiresInSec,
    });
  };

  private setToken = (res: Response, token: string) => {
    const options: CookieOptions = {
      maxAge: config.jwt.expiresInSec * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    };
    res.cookie(config.cookie.tokenKey, token, options);
  };

  private generateCSRFToken = async () => {
    return bcrypt.hash(config.csrf.plainToken, 1);
  };

  private removeToken = (res: Response) => {
    res.cookie(config.cookie.tokenKey, '');
  };
  // 휴면 계정 안내 이메일 전송?
}
