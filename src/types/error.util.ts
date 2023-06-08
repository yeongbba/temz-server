export enum ErrorCode {
  NULL_ARGS = 'null-arguments',
  DUPLICATED_VALUE = 'duplicated-value',
  INVALID_VALUE = 'invalid-value',
  NOT_ACCEPTABLE = 'not-acceptable',
  NOT_FOUND = 'not-found',
  INTERNAL_SERVER = 'internal-server',
  BAD_REQUEST = 'bad-request',
  TOO_MANY_REQUEST = 'too-many-request',
  // openAPI
  REQUIRED_OPENAPI = 'required.openapi.validation',
  MINLENGTH_OPENAPI = 'minLength.openapi.validation',
  MAXLENGTH_OPENAPI = 'maxLength.openapi.validation',
  MAXITEMS_OPENAPI = 'maxItems.openapi.validation',
  TYPE_OPENAPI = 'type.openapi.validation',
  X_EOV_TYPE_OPENAPI = 'x-eov-type.openapi.validation',
  FORMAT_OPENAPI = 'format.openapi.validation',
  PATTERN_OPENAPI = 'pattern.openapi.validation',
  MAXIMUM_OPENAPI = 'maximum.openapi.validation',
  MINIMUM_OPENAPI = 'minimum.openapi.validation',
}
