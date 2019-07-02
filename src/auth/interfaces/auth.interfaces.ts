export interface UserPayload {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  iat: number;
  exp: number;
}

export interface RegistrationStatus {
  success: boolean;
  message: string;
}

export interface AuthorizationDBModel {
  token: string;
  expiry: Date;
  scope: string;
}
