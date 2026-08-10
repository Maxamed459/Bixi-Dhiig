import { getRedisClient } from "../lib/redis.js";
import crypto from "crypto";

const REFRESH_TOKEN_PREFIX: string = "refresh";
const DEFAULT_REFRESH_TOKEN_PREFIX: number = 7 * 24 * 60 * 60;

interface refreshRecord {
  userId: string;
  refreshToken: string;
}

export const hashRefreshToken = (refreshToken: string) => {
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
};

export const rotateRefreshToken = async (
  userId: string,
  ttlseconds = DEFAULT_REFRESH_TOKEN_PREFIX,
) => {
  const client = getRedisClient();
  const rediskey = `refresh:${userId}`;

  await client.set(
    rediskey,
    JSON.stringify({
      userId,
    }),
    {
      EX: ttlseconds,
    },
  );
};

export const checkRedisHashRefreshToken = async (rediskey: string) => {
  const client = getRedisClient();
  return await client.get(rediskey);
};
