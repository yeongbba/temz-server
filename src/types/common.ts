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

export type AllTestValueType = ItemCountValue | TypeValue | MaxLengthValue | FormatValue | PatternValue | MissingValue;
export type ItemCountValue = { parentFieldName?: string; failedFieldName: string; maxItems: number };
export type TypeValue = {
  parentFieldName?: string;
  failedFieldName: string;
  fakeValue: any;
  type: string;
  item?: boolean;
};
export type MaxLengthValue = { parentFieldName?: string; failedFieldName: string; fakeValue: any; maxLength: number };
export type MinLengthValue = { parentFieldName?: string; failedFieldName: string; fakeValue: any; minLength: number };
export type FormatValue = { parentFieldName?: string; failedFieldName: string; fakeValue: any; format: string };
export type PatternValue = { parentFieldName?: string; failedFieldName: string; fakeValue: any; pattern: string };
export type MissingValue = { parentFieldName?: string; failedFieldName: string };
