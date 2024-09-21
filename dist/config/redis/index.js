"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
exports.startRedis = startRedis;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || "",
});
exports.redis = redis;
async function startRedis() {
    try {
        const start = await redis.connect();
        start && console.log("redis service started");
    }
    catch (err) {
        redis.disconnect();
        console.log("Error occurred on redis", err);
    }
}
