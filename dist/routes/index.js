"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const login_register_1 = require("../utils/middlewares/routes/login&register");
const functions_1 = require("../utils/middlewares/validators/functions");
const csrf_csrf_1 = require("../config/csrf-csrf");
const router = express_1.default.Router();
// ----------------------------------------------> Authentication Routes <-------------------------------------------------------------------------
router.post("/register", functions_1.validateRegisterRequest, login_register_1.register);
router.post("/login", functions_1.validateLoginRequest, login_register_1.login);
router.post("/refresh_auth", login_register_1.validateAuthentication, login_register_1.refreshToken);
router.post("/logout", login_register_1.validateAuthentication, csrf_csrf_1.csrfMiddleware, login_register_1.logout);
// -----------------------------------------------> End of Authentication Routes <-------------------------------------------------------------------
exports.default = router;
