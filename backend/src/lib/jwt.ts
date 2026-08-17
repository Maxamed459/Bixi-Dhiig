import { SignJWT, jwtVerify } from "jose";
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
} from "../config/dotenv.js";
import { JwtPayload } from "../types/types.js";

const ACCESS_JWT_SECRET = new TextEncoder().encode(JWT_ACCESS_SECRET);
const REFRESH_JWT_SECRET = new TextEncoder().encode(JWT_REFRESH_SECRET);

export const generateJwtToken = async (
  payload: JwtPayload,
  JWT_SECRET: string,
  expiresin: string,
): Promise<string> => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not available please provide it");
  }
  const ENCODED_JWT_SECRET = new TextEncoder().encode(JWT_SECRET);
  const token = await new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuedAt()
    .setExpirationTime(expiresin)
    .sign(ENCODED_JWT_SECRET);

  return token;
};

export async function verifyJwtToken(token: string, JWT_SECRET: string) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not available please provide it");
  }
  const ENCODED_JWT_SECRET = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, ENCODED_JWT_SECRET, {
    algorithms: ["HS256"],
  });

  if (!payload) {
    throw new Error("Invalid refresh token");
  }

  return payload;
}
