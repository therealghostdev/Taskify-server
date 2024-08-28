"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const login_register_1 = require("../utils/middlewares/routes/login&register");
const functions_1 = require("../utils/middlewares/validators/functions");
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
// ----------------------------------------------> Authentication Routes <-------------------------------------------------------------------------
router.post("/register", functions_1.validateRegisterRequest, login_register_1.register);
router.post("/login", functions_1.validateLoginRequest, login_register_1.login);
router.get("/auth/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport_1.default.authenticate("google", {
    session: false,
    failureRedirect: "/login",
}), login_register_1.googleAuth);
// -----------------------------------------------> End of Authentication Routes <-------------------------------------------------------------------
exports.default = router;
