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

export type SelectedField = { parentFieldName?: string; failedFieldName: string };

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

/* filter */
export class Filter {
  limit?: number;
  skip?: number;
  sort?: { [field: string]: 1 | -1 };
  condition?: { [field: string]: any };

  constructor(filter?: {
    limit?: number;
    skip?: number;
    sort?: { [field: string]: 1 | -1 };
    condition?: { [field: string]: any };
  }) {
    this.limit = filter?.limit;
    this.skip = filter?.skip;
    this.sort = filter?.sort;
    this.condition = filter?.condition;
  }

  static parse(raw: any) {
    const filter = new Filter(raw);
    return filter;
  }

  toJson() {
    return {
      limit: this.limit,
      skip: this.skip,
      sort: this.sort,
      condition: this.condition,
    };
  }
}
