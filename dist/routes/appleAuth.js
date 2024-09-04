"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appleAuthRouter = void 0;
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const login_register_1 = require("../utils/middlewares/routes/login&register");
// import { loginLimiter } from "../config/rate-limiter";
exports.appleAuthRouter = express_1.default.Router();
// Initiate Apple Login
exports.appleAuthRouter.get("/apple_auth", (req, res, next) => {
    const { username } = req.query;
    passport_1.default.authenticate("google", {
        scope: ["profile", "email"],
        state: username,
    })(req, res, next);
});
// Handle Apple Callback
exports.appleAuthRouter.post("/apple/callback", passport_1.default.authenticate("apple", { failureRedirect: "/" }), login_register_1.appleAuth);
