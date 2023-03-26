export enum ErrorCode {
  NULL_ARGS = 'null-arguments',
  DUPLICATED_VALUE = 'duplicated-value',
  INVALID_VALUE = 'invalid-value',
  NOT_FOUND = 'not-found',
  INTERNAL_SERVER = 'internal-server',
  BAD_REQUEST = 'bad-request',
  TOO_MANY_REQUEST = 'too-many-request',
  // openAPI
  REQUIRED_OPENAPI = 'required.openapi.validation',
  MINLENGTH_OPENAPI = 'minLength.openapi.validation',
  MAXLENGTH_OPENAPI = 'maxLength.openapi.validation',
  FORMAT_OPENAPI = 'format.openapi.validation',
  PATTERN_OPENAPI = 'pattern.openapi.validation',
}
