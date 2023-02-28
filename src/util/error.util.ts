import { ErrorCode } from '../types/error.util';

export class FailureObject {
  constructor(private code: ErrorCode, private message: string, private status?: number) {}

  get getStatus() {
    return this.status;
  }

  get getCode() {
    return this.code;
  }

  get getMessage() {
    return this.message;
  }
}
