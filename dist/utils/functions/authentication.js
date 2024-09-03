"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueJWT = issueJWT;
exports.genPassword = genPassword;
exports.validatePassword = validatePassword;
exports.blacklistToken = blacklistToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("../../config/redis/client");
dotenv_1.default.config();
function issueJWT(user) {
    const _id = user._id;
    const tokenVersion = 0;
    const expiresIn = "1d";
    const payload = {
        sub: _id,
        iat: Date.now(),
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
function blacklistToken(key, exp) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client_1.redis.set(`blacklist_${key}`, "true", { EX: exp });
    });
}
