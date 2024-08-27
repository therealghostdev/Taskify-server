"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserLogin = exports.validateUserReg = void 0;
const joi_1 = __importDefault(require("joi"));
const validateUserReg = joi_1.default.object({
    username: joi_1.default
        .string()
        .pattern(/^(?=.*[0-9])(?=[a-zA-Z]{3,})[a-zA-Z0-9]{3,30}$/)
        .message("Username must be 3-30 characters long, start with at least 3 letters, and must include numbers")
        .required(),
    firstname: joi_1.default
        .string()
        .min(3)
        .max(30)
        .message("Firstname must contain minimum of 3 characters")
        .required(),
    lastname: joi_1.default
        .string()
        .min(3)
        .max(30)
        .message("Lastname must contain minimum of 3 characters")
        .required(),
    password: joi_1.default
        .string()
        .pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[0-9a-zA-Z]).{8,}$/)
        .message("Password must be at least 8 characters long and contain at least one uppercase letter and one special character")
        .required(),
});
exports.validateUserReg = validateUserReg;
const validateUserLogin = joi_1.default.object({
    username: joi_1.default
        .string()
        .pattern(/^(?=.*[0-9])(?=[a-zA-Z]{3,})[a-zA-Z0-9]{3,30}$/)
        .message("Username must be 3-30 characters long, start with at least 3 letters, and must include numbers")
        .required(),
    password: joi_1.default
        .string()
        .pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[0-9a-zA-Z]).{8,}$/)
        .message("Password must be at least 8 characters long and contain at least one uppercase letter and one special character")
        .required(),
});
exports.validateUserLogin = validateUserLogin;
