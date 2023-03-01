import { ErrorCode } from '../types/error.util';

export class FailureObject {
  constructor(
    private code: ErrorCode | string,
    private message: string,
    private status?: number,
    private reason?: string
  ) {}

  get getStatus() {
    return this.status;
  }

  get getCode() {
    return this.code;
  }

  get getMessage() {
    return this.message;
  }

  get getReason() {
    return this.reason;
  }
}
