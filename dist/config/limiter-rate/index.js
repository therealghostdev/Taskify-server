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
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginLimiter = exports.limiter = void 0;
const express_rate_limit_1 = require("express-rate-limit");
const redis_1 = require("../redis");
const rate_limit_redis_1 = require("rate-limit-redis");
exports.limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    store: new rate_limit_redis_1.RedisStore({
        sendCommand: (...args) => __awaiter(void 0, void 0, void 0, function* () {
            console.log("here");
            return yield redis_1.redis.sendCommand(args);
        }),
    }),
});
exports.loginLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts from this IP, please try again after 15 minutes",
    store: new rate_limit_redis_1.RedisStore({
        sendCommand: (...args) => __awaiter(void 0, void 0, void 0, function* () { return yield redis_1.redis.sendCommand(args); }),
    }),
});
