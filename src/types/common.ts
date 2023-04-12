import { AxiosInstance, Method } from 'axios';
import http from 'http';
import { MongoDB } from '../database/mongo';
import { Redis } from '../database/redis';

export type ServerInfo = {
  server: http.Server;
  db: MongoDB;
  redis: {
    rateLimitDB: Redis;
    verifyCodeDB: Redis;
  };
};

export type TestFunction = (
  request: AxiosInstance,
  options: {
    method: Method;
    url: string;
    data?: any;
    params?: any;
  },
  value: AllTestValueType | null,
  reason?: string
) => Promise<void>;

export type TestOptions = {
  method: Method;
  url: string;
  data?: any;
  params?: any;
};

export type AllTestValueType = ItemCountValue | TypeValue | maxLengthValue | formatValue | missingValue;
export type ItemCountValue = { parentFieldName?: string; failedFieldName: string; maxItems: number };
export type TypeValue = {
  parentFieldName?: string;
  failedFieldName: string;
  fakeValue: any;
  type: string;
  item?: boolean;
};
export type maxLengthValue = { parentFieldName?: string; failedFieldName: string; fakeValue: any; maxLength: number };
export type minLengthValue = { parentFieldName?: string; failedFieldName: string; fakeValue: any; minLength: number };
export type formatValue = { parentFieldName?: string; failedFieldName: string; fakeValue: any; format: string };
export type missingValue = { parentFieldName?: string; failedFieldName: string };
