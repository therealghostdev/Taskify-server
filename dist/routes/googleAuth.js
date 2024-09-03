"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthRouter = void 0;
const passport_1 = __importDefault(require("passport"));
const express_1 = __importDefault(require("express"));
const login_register_1 = require("../utils/middlewares/routes/login&register");
const rate_limiter_1 = require("../config/rate-limiter");
exports.googleAuthRouter = express_1.default.Router();
// initilize google authentication
exports.googleAuthRouter.get("/google_auth", rate_limiter_1.limiter, (req, res, next) => {
    const { username } = req.query;
    passport_1.default.authenticate("google", {
        scope: ["profile", "email"],
        state: username,
    })(req, res, next);
});
exports.googleAuthRouter.get("/google/callback", rate_limiter_1.limiter, passport_1.default.authenticate("google", { failureRedirect: "/" }), login_register_1.googleAuth);
