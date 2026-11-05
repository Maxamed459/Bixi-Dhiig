export interface JwtPayload {
  sub: string;
  role: string;
  canDonate?: boolean;
  canRequest?: boolean;
  type: string;
  [key: string]: unknown;
}
