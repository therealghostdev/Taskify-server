/* eslint-disable @typescript-eslint/no-explicit-any */
import jsonwebtoken from "jsonwebtoken";
import { userSession } from "../types";
import dotenv from "dotenv";
import crypto from "crypto";
import { redis } from "../../config/redis";

dotenv.config();

function issueJWT(user: userSession, version?: number) {
  const _id = user._id;
  const tokenVersion = version || 0;

  const expiresIn = "24h";

  const payload = {
    sub: _id,
    iat: Math.floor(Date.now() / 1000),
    version: tokenVersion,
  };

  const PRIV_KEY = process.env.RSA_PRIVATE_KEY;

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY ? PRIV_KEY : "", {
    expiresIn: expiresIn,
    algorithm: "RS256",
  });

  const refreshToken = jsonwebtoken.sign(payload, PRIV_KEY ? PRIV_KEY : "", {
    algorithm: "RS256",
    expiresIn: "7d",
  });

  return {
    refreshToken: { value: refreshToken, version: payload.version },
    token: "Bearer " + signedToken,
    expires: expiresIn,
    csrf: "",
  };
}

function genPassword(password: string) {
  const salt = crypto.randomBytes(32).toString("hex");
  const genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return {
    salt: salt,
    hash: genHash,
  };
}

function validatePassword(password: string, hash: string, salt: string) {
  const verify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return hash === verify;
}

const createUserSession = (user: any): userSession => {
  const data = {
    _id: user._id,
    firstname: user.firstName,
    lastname: user.lastName,
    username: user.userName,
    auth_data: {
      token: "",
      expires: "",
      refreshToken: { value: "", version: 0 },
      csrf: "",
    },
  };
  return data;
};

async function blacklistToken(key: string, exp: number) {
  await redis.set(`blacklist_${key}`, "true", { EX: exp });
}

async function cacheTaskData(key: string, data: string) {
  await redis.set(`cache_task_${key}`, data);
}

async function getCacheTaskData(key: string) {
  const cachedData = await redis.get(`cache_task_${key}`);
  return cachedData ? JSON.parse(cachedData) : null;
}

const invalidateCacheTaskData = async (key: string) => {
  await redis.del(`cache_task_${key}`);
};

export {
  issueJWT,
  genPassword,
  validatePassword,
  blacklistToken,
  createUserSession,
  cacheTaskData,
  getCacheTaskData,
  invalidateCacheTaskData,
};
