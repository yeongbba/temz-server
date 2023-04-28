import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config';
import { CookieOptions, Request, Response } from 'express';
import { FailureObject } from '../util/error.util';
import { ErrorCode } from '../types/error.util';
import { RefreshToken, User } from '../types/auth';
import { getToken } from '../util/auth.util';

export class AuthController {
  constructor(private userRepository: any) {}

  checkName = async (req: Request, res: Response) => {
    const name = req.query.name as string;
    const user: User = await this.userRepository.findByName(name);
    res.status(200).json({ isValid: !user.userId });
  };

  me = async (req: Request, res: Response) => {
    const user: User = await this.userRepository.findById((req as any).userId);
    if (!user.userId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
      throw failure;
    }

    res.status(200).json({ user: user.toJson() });
  };

  csrf = async (req: Request, res: Response) => {
    const token = await this.generateCSRFToken();
    res.status(200).json({ token });
  };

  signup = async (req: Request, res: Response) => {
    const { name, password, email, phone, profile, wallet } = req.body;

    const userByName: User = await this.userRepository.findByName(name);
    if (userByName.userId) {
      const failure = new FailureObject(ErrorCode.DUPLICATED_VALUE, `${name} already exists`, 409);
      throw failure;
    }

    const userByPhone: User = await this.userRepository.findByPhone(phone);
    if (userByPhone.userId) {
      const oldPhone = userByPhone.phone;
      userByPhone.phone = null;
      await this.userRepository.updateUser(userByPhone, oldPhone);
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
    const userByName: User = await this.userRepository.findByName(name);

    const failure = new FailureObject(ErrorCode.INVALID_VALUE, 'Invalid user or password', 401);
    if (!userByName.userId) {
      throw failure;
    }

    const user: User = await this.userRepository.findById(userByName.userId);
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      user.failLoginCount = user.failLoginCount++;
      await this.userRepository.updateUser(user);
      throw failure;
    }

    if (!user.phone) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'Phone number was not found', 404);
      throw failure;
    }

    const access = this.createJwtToken(user.userId, 'access');
    this.setToken(res, access, 'access');

    const refresh = this.createJwtToken(user.userId, 'refresh');
    this.setToken(res, refresh, 'refresh');
    user.refreshToken = refresh;

    user.failLoginCount = 0;
    user.lastLogin = new Date();
    await this.userRepository.updateUser(user);

    res.status(201).json({ token: { access, refresh }, user: user.toJson() });
  };

  findName = async (req: Request, res: Response) => {
    const { phone } = req.body;
    const userByPhone: User = await this.userRepository.findByPhone(phone);
    if (!userByPhone.userId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
      throw failure;
    }

    const user: User = await this.userRepository.findById(userByPhone.userId);
    res.status(200).json({ name: user.name });
  };

  resetPassword = async (req: Request, res: Response) => {
    const { name, password } = req.body;

    const userByName: User = await this.userRepository.findByName(name);
    if (!userByName.userId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
      throw failure;
    }

    const user: User = await this.userRepository.findById(userByName.userId);
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      const failure = new FailureObject(ErrorCode.INVALID_VALUE, 'Invalid password', 400);
      throw failure;
    }

    user.password = await bcrypt.hash(password, config.bcrypt.saltRounds);
    user.lastResetPassword = new Date();
    await this.userRepository.updateUser(user);
    res.sendStatus(201);
  };

  checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    const user: User = await this.userRepository.findById((req as any).userId);

    if (!user.userId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
      throw failure;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    res.status(200).json({ isValid: isValidPassword });
  };

  checkPhone = async (req: Request, res: Response) => {
    const { name, phone } = req.body;
    const userByPhone: User = await this.userRepository.findByPhone(phone);
    if (!userByPhone.userId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
      throw failure;
    }

    const user: User = await this.userRepository.findById(userByPhone.userId);
    if (user.name !== name) {
      const failure = new FailureObject(ErrorCode.INVALID_VALUE, 'Name does not match the owner of the phone', 400);
      throw failure;
    }

    res.sendStatus(200);
  };

  logout = (req: Request, res: Response) => {
    this.removeToken(res, 'access');
    this.removeToken(res, 'refresh');
    res.sendStatus(201);
  };

  update = async (req: Request, res: Response) => {
    const { name, profile, email, phone, wallet } = req.body;
    const data = User.parse({
      id: (req as any).userId,
      name,
      profile,
      email,
      phone,
      wallet,
    });

    const oldUser: User = await this.userRepository.findById(data.userId);
    const newUser: User = await this.userRepository.updateUser(data, oldUser.phone);
    if (!newUser.userId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
      throw failure;
    }

    res.sendStatus(204);
  };

  remove = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const user: User = await this.userRepository.findById(userId);
    if (!user.userId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
      throw failure;
    }

    await this.userRepository.removeUser(user);
    this.removeToken(res, 'access');
    this.removeToken(res, 'refresh');
    res.sendStatus(204);
  };

  wakeup = async (req: Request, res: Response) => {
    const data = User.parse({
      id: (req as any).userId,
      isDormant: false,
    });

    const user: User = await this.userRepository.updateUser(data);
    if (!user.userId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
      throw failure;
    }

    res.sendStatus(204);
  };

  token = async (req: Request, res: Response) => {
    const token = getToken(req, 'refresh');
    const refresh: RefreshToken = await this.userRepository.findRefreshToken(token);

    const InvalidFailure = new FailureObject(ErrorCode.INVALID_VALUE, 'Refresh token is invalid', 401);
    if (!refresh) {
      await this.userRepository.removeRefreshToken(token);
      throw InvalidFailure;
    }

    const decoded = jwt.verify(token, config.jwt.refreshSecretKey) as JwtPayload;
    if (decoded) {
      const user = await this.userRepository.findById((decoded as JwtPayload).id);

      if (!user) {
        await this.userRepository.removeRefreshToken(token);
        throw InvalidFailure;
      }

      const access = this.createJwtToken(user.userId, 'access');
      this.setToken(res, access, 'access');
      res.status(201).json({ token: { access } });
    } else {
      await this.userRepository.removeRefreshToken(token);
    }
  };

  private createJwtToken = (id: string, type: 'access' | 'refresh') => {
    const isAccess = type === 'access' ? true : false;
    const secretKey = isAccess ? config.jwt.accessSecretKey : config.jwt.refreshSecretKey;
    const expiresInSec = isAccess ? config.jwt.accessExpiresInSec : config.jwt.refreshExpiresInSec;
    return jwt.sign({ id }, secretKey, {
      expiresIn: expiresInSec,
    });
  };

  private setToken = (res: Response, token: string, type: 'access' | 'refresh') => {
    const isAccess = type === 'access' ? true : false;
    const expiresInSec = isAccess ? config.jwt.accessExpiresInSec : config.jwt.refreshExpiresInSec;
    const tokenKey = isAccess ? config.cookie.accessTokenKey : config.cookie.refreshTokenKey;
    const options: CookieOptions = {
      maxAge: expiresInSec * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    };
    res.cookie(tokenKey, token, options);
  };

  private generateCSRFToken = async () => {
    return bcrypt.hash(config.csrf.plainToken, 1);
  };

  private removeToken = (res: Response, type: 'access' | 'refresh') => {
    const isAccess = type === 'access' ? true : false;
    const tokenKey = isAccess ? config.cookie.accessTokenKey : config.cookie.refreshTokenKey;
    res.cookie(tokenKey, '');
  };
}
