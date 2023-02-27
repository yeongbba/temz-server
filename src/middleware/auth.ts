import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../../config';
import * as userRepository from '../data/auth';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';

const AUTH_ERROR = { message: 'Authentication Error' };

export const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get('Authorization');
  if (!(authHeader && authHeader.startsWith('Bearer '))) {
    return res.status(401).json(AUTH_ERROR);
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, config.jwt.secretKey, async (error, decoded) => {
    if (error) {
      return res.status(401).json(AUTH_ERROR);
    }

    const user = await userRepository.findById((decoded as JwtPayload).id);
    if (!user) {
      return res.status(401).json(AUTH_ERROR);
    }

    (req as any).userId = user.id; // req.customData
    next();
  });
};

export const authHandler = async (req: Request, scopes: string[], schema: OpenAPIV3.SecuritySchemeObject) => {
  const authHeader = req.get('Authorization');
  let token = authHeader.split(' ')[1];

  if (!token) {
    token = req.cookies['token'];
  }

  if (!token) {
    throw { status: 401, ...AUTH_ERROR };
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secretKey);
    const user = await userRepository.findById((decoded as JwtPayload).id);
    if (!user) {
      throw { status: 401, ...AUTH_ERROR };
    }
    (req as any).userId = user.id;
    (req as any).token = decoded;
    return true;
  } catch (err) {
    console.error(err);
    throw { status: 401, ...AUTH_ERROR };
  }
};
