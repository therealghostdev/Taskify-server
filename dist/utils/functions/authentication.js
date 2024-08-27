"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueJWT = issueJWT;
exports.genPassword = genPassword;
exports.validatePassword = validatePassword;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config();
function issueJWT(user) {
    const _id = user._id;
    const expiresIn = "1d";
    const payload = {
        sub: _id,
        iat: Date.now(),
    };
    const PRIV_KEY = process.env.RSA_PRIVATE_KEY;
    const signedToken = jsonwebtoken_1.default.sign(payload, PRIV_KEY ? PRIV_KEY : "", {
        expiresIn: expiresIn,
        algorithm: "RS256",
    });
    return {
        token: "Bearer " + signedToken,
        expires: expiresIn,
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
