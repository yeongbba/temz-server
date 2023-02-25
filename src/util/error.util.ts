import { ErrorCode } from 'util';

export class FailureObject {
  constructor(private code: ErrorCode, private message: string) {}
}
