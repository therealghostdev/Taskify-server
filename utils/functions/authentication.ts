import jsonwebtoken from "jsonwebtoken";
import { userType } from "../types";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

function issueJWT(user: userType) {
  const _id = user._id;

  const expiresIn = "1d";

  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const PRIV_KEY = process.env.RSA_PRIVATE_KEY;

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY ? PRIV_KEY : "", {
    expiresIn: expiresIn,
    algorithm: "RS256",
  });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn,
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

export { issueJWT, genPassword };
