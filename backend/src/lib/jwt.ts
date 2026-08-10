import { SignJWT, jwtVerify } from "jose";
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
} from "../config/dotenv.js";

const ACCESS_JWT_SECRET = new TextEncoder().encode(JWT_ACCESS_SECRET);
const REFRESH_JWT_SECRET = new TextEncoder().encode(JWT_REFRESH_SECRET);

export const createAccessToken = async (userId: string): Promise<string> => {
  const expiration = JWT_ACCESS_EXPIRES_IN!;

  const jwt = await new SignJWT({
    sub: userId,
    type: "access",
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(ACCESS_JWT_SECRET);

  return jwt;
};

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, ACCESS_JWT_SECRET, {
    algorithms: ["HS256"],
  });

  if (!payload) {
    throw new Error("Invalid refresh token");
  }

  return payload;
}

export const createRefreshToken = async (userId: string): Promise<string> => {
  const expiration = JWT_REFRESH_EXPIRES_IN!;

  const jwt = await new SignJWT({
    sub: userId,
    type: "refresh",
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(REFRESH_JWT_SECRET);

  return jwt;
};

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, REFRESH_JWT_SECRET, {
    algorithms: ["HS256"],
  });

  if (!payload) {
    throw new Error("Invalid refresh token");
  }

  return payload;
}
