export interface JwtPayload {
  id?: number;
  email: string;
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
  accessToken: string;
  expiry: Date;
  scope: string;
}
