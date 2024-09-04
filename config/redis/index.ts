import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redis = createClient({
  url: process.env.REDIS_URL || "",
});

async function startRedis() {
  try {
    const start = await redis.connect();
    start && console.log("redis service started");
  } catch (err) {
    redis.disconnect();
    console.log("Error occurred on redis", err);
  }
}

export { startRedis, redis };
