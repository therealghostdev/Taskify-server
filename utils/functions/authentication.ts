/* eslint-disable @typescript-eslint/no-explicit-any */
import jsonwebtoken from "jsonwebtoken";
import { userSession } from "../types";
import dotenv from "dotenv";
import crypto from "crypto";
import { redis } from "../../config/redis";

dotenv.config();

function issueJWT(user: userSession) {
  const _id = user._id;
  const tokenVersion = 0;

  const expiresIn = "1d";

  const payload = {
    sub: _id,
    iat: Date.now(),
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
  console.log("This function ran");
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
  console.log("You should get this:", data);

  return data;
};

async function blacklistToken(key: string, exp: number) {
  await redis.set(`blacklist_${key}`, "true", { EX: exp });
}

export {
  issueJWT,
  genPassword,
  validatePassword,
  blacklistToken,
  createUserSession,
};
