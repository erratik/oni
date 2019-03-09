export interface JwtPayload {
  id: string;
  email: string;
  firstname: string;
  iat: number;
  exp: number;
}

export interface RegistrationStatus {
  success: boolean;
  message: string;
}

export interface IToken {
  token: string;
  expiry?: Date;
  scope?: string;
}

export interface AuthorizationDBModel {
  token: string;
  expiry: Date;
  scope: string;
}
