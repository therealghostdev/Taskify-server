"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const login_register_1 = require("../routes/login&register");
const router = (0, express_1.default)();
router.post("/register", login_register_1.register);
router.post("/login", login_register_1.login);
