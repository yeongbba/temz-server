import { FailureObject } from '../error.util';

export const fakeFailures = (failures: FailureObject[]) => ({
  failures: failures.map((failure) => ({
    code: failure.getCode,
    message: failure.getMessage,
    status: failure.getStatus,
    reason: failure.getReason,
  })),
});
