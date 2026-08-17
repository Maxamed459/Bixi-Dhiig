export interface JwtPayload {
  sub: string;
  role: string;
  type: string;
  [key: string]: unknown;
}
