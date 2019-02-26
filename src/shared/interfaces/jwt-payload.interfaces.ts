export interface JwtPayload {
  email: string;
}

export interface TokenResponse {
  accessToken: string;
  expiry?: Date;
  scope?: string;
}
