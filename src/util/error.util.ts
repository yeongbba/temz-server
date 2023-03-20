import { ErrorCode } from '../types/error.util';

export class FailureObject extends Error {
  constructor(private code: ErrorCode | string, private msg: string, private status?: number, private reason?: string) {
    super(msg);
  }

  get getStatus() {
    return this.status;
  }

  get getCode() {
    return this.code;
  }

  get getMessage() {
    return this.msg;
  }

  get getReason() {
    return this.reason;
  }
}
