"use strict";
// import { rateLimit } from "express-rate-limit";
// import { redis } from "../redis";
// import { RedisStore } from "rate-limit-redis";
// export const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   limit: 200,
//   standardHeaders: "draft-7",
//   legacyHeaders: false,
//   store: new RedisStore({
//     sendCommand: async (...args: string[]) => {
//       console.log("here");
//       return await redis.sendCommand(args);
//     },
//   }),
// });
// export const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   message:
//     "Too many login attempts from this IP, please try again after 15 minutes",
//   store: new RedisStore({
//     sendCommand: async (...args: string[]) => await redis.sendCommand(args),
//   }),
// });
