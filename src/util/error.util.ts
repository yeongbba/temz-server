import { ErrorCode } from '../types/error.util';

export class FailureObject {
  constructor(private code: ErrorCode, private message: string) {}
}
