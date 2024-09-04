"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueJWT = issueJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
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
