import { createClient, RedisClientType } from "redis";

let client: RedisClientType;

export const initRedisclient = async () => {
  if (!client) {
    client = createClient();
    client.on("error", (err) => console.log("Redis client error:", err));
  }
  if (!client.isOpen) {
    await client.connect();
    console.log("Redis client connected successfully!");
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!client) {
    throw new Error(
      "Redis client not initialized. Call initRedisClient first.",
    );
  }
  return client;
};
