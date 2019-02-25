export interface JwtPayload {
  email: string;
}

export interface TokenResponse {
  expiresIn: number;
  accessToken: string;
  notBefore?: number;
}
