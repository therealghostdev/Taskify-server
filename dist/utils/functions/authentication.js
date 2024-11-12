"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCacheTaskData = exports.createUserSession = void 0;
exports.issueJWT = issueJWT;
exports.genPassword = genPassword;
exports.validatePassword = validatePassword;
exports.blacklistToken = blacklistToken;
exports.cacheTaskData = cacheTaskData;
exports.getCacheTaskData = getCacheTaskData;
/* eslint-disable @typescript-eslint/no-explicit-any */
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const redis_1 = require("../../config/redis");
dotenv_1.default.config();
function issueJWT(user, version) {
    const _id = user._id;
    const tokenVersion = version || 0;
    const expiresIn = "24h";
    const payload = {
        sub: _id,
        iat: Math.floor(Date.now() / 1000),
        version: tokenVersion,
    };
    const PRIV_KEY = process.env.RSA_PRIVATE_KEY;
    const signedToken = jsonwebtoken_1.default.sign(payload, PRIV_KEY ? PRIV_KEY : "", {
        expiresIn: expiresIn,
        algorithm: "RS256",
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, PRIV_KEY ? PRIV_KEY : "", {
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
function genPassword(password) {
    const salt = crypto_1.default.randomBytes(32).toString("hex");
    const genHash = crypto_1.default
        .pbkdf2Sync(password, salt, 10000, 64, "sha512")
        .toString("hex");
    return {
        salt: salt,
        hash: genHash,
    };
}
function validatePassword(password, hash, salt) {
    const verify = crypto_1.default
        .pbkdf2Sync(password, salt, 10000, 64, "sha512")
        .toString("hex");
    return hash === verify;
}
const createUserSession = (user) => {
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
exports.createUserSession = createUserSession;
async function blacklistToken(key, exp) {
    await redis_1.redis.set(`blacklist_${key}`, "true", { EX: exp });
}
async function cacheTaskData(key, data) {
    await redis_1.redis.set(`cache_task_${key}`, data);
}
async function getCacheTaskData(key) {
    const cachedData = await redis_1.redis.get(`cache_task_${key}`);
    return cachedData ? JSON.parse(cachedData) : null;
}
const invalidateCacheTaskData = async (key) => {
    const result = await redis_1.redis.del(`cache_task_${key}`);
    console.log(`Cache invalidated for key ${key}:`, result ? "Success" : "Failed");
};
exports.invalidateCacheTaskData = invalidateCacheTaskData;
