export enum VerificationTokenKeys {
  CODE = 'code',
  COUNT = 'count',
}

export class VerificationToken {
  code: number;
  count: number;

  constructor(token?: { code: number; count: number }) {
    this.code = token?.code;
    this.count = token?.count;
  }

  static parse(raw: any) {
    if (!raw) {
      return null;
    }

    return new VerificationToken(raw);
  }

  keys() {
    return Object.getOwnPropertyNames(new VerificationToken());
  }
}
