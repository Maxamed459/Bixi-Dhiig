import { SignJWT, jwtVerify } from "jose";
import { JWT_ACCESS_SECRET } from "../config/dotenv.js";

const JWT_SECRET = new TextEncoder().encode(JWT_ACCESS_SECRET);

export const createJwtToken = async (
  userId: string,
  type: "access" | "refresh",
): Promise<string> => {
  const expiration = type === "access" ? "15m" : "7d";

  const jwt = await new SignJWT({
    sub: userId,
    type,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(JWT_SECRET);

  console.log("jwt", jwt);

  return jwt;
};

export async function verifyJwtToken(token: string) {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    algorithms: ["HS256"],
  });

  //   if (!payload) {
  //     throw new Error("Invalid refresh token");
  //   }

  return payload;
}
