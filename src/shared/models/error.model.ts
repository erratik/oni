export enum ErrorCode {
  AUTHENTICATION_METHOD_NOT_VALID = 'AUTHENTICATION_METHOD_NOT_VALID',
  AUTHORIZATION_MISSING = 'AUTHORIZATION_MISSING',
}

export class ErrorModel {
  constructor(public readonly code: ErrorCode, public readonly message?: string) {}
}

export interface ValidationErrorEntry {
  key: string;
  message: string;
}

export interface ValidationOutput {
  data: any;
  errors: Array<ValidationErrorEntry>;
}
