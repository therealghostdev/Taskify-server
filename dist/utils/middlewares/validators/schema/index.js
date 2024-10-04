"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTaskUpdateParam = exports.validateTaskUpdate = exports.validateTaskQuery = exports.validateTask = exports.validateUserLogin = exports.validateUserReg = void 0;
const joi_1 = __importDefault(require("joi"));
const validateUserReg = joi_1.default.object({
    username: joi_1.default.string().required().messages({
        "any.required": "Username is required",
    }),
    firstname: joi_1.default.string().min(3).max(30).required().messages({
        "string.base": "Firstname must be a string",
        "string.min": "Firstname must contain minimum of 3 characters",
        "any.required": "Firstname is required",
    }),
    lastname: joi_1.default.string().min(3).max(30).required().messages({
        "string.base": "Lastname must be a string",
        "string.min": "Lastname must contain minimum of 3 characters",
        "any.required": "Lastname is required",
    }),
    password: joi_1.default
        .string()
        .pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[0-9a-zA-Z]).{8,}$/)
        .required()
        .messages({
        "string.pattern.base": "Password must be at least 8 characters long and contain at least one uppercase letter and one special character",
        "any.required": "Password is required",
    }),
});
exports.validateUserReg = validateUserReg;
const validateUserLogin = joi_1.default.object({
    username: joi_1.default.string().required(),
    password: joi_1.default
        .string()
        .pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[0-9a-zA-Z]).{8,}$/)
        .message("Password must be at least 8 characters long and contain at least one uppercase letter and one special character")
        .required(),
});
exports.validateUserLogin = validateUserLogin;
const validateTask = joi_1.default.object({
    name: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    priority: joi_1.default.number().required(),
    category: joi_1.default.string().required(),
    expected_completion_time: joi_1.default.date().required(),
});
exports.validateTask = validateTask;
const validateTaskQuery = joi_1.default.object({
    filter_by_date: joi_1.default.date().iso().required(),
    status: joi_1.default.string().valid("complete", "incomplete"),
});
exports.validateTaskQuery = validateTaskQuery;
const validateTaskUpdate = joi_1.default.object({
    name: joi_1.default.string().min(3).required().messages({
        "string.base": "Task name must be a string",
        "string.min": "Task name must be 3 characters or more",
        "any.required": "Task name is required",
    }),
    description: joi_1.default.string().min(10).messages({
        "string.base": "Description must be a string",
        "string.min": "Description must be a minimum of 10 characters",
    }),
    category: joi_1.default.string().min(4).messages({
        "string.base": "Category must be a string",
        "string.min": "Category must be a minimum of 4 characters",
    }),
    isRoutine: joi_1.default.boolean().messages({
        "boolean.base": "isRoutine must be of type boolean",
    }),
    expected_completion_time: joi_1.default.date().iso().messages({
        "date.base": "'expected_date_of_completion' must be a valid date",
        "date.iso": "'expected_date_of_completion' must be in ISO date format",
    }),
    recurrence: joi_1.default.string().valid("daily", "weekly", "monthly").messages({
        "any.only": "Recurrence must be one of 'daily', 'weekly', or 'monthly'",
    }),
});
exports.validateTaskUpdate = validateTaskUpdate;
const validateTaskUpdateParam = joi_1.default.object({
    name: joi_1.default.string().min(3).required().messages({
        "string.base": "Task name must be a string",
        "string.min": "Task name must be 3 characters or more",
        "any.required": "Task name is required",
    }),
    description: joi_1.default.string().min(10).messages({
        "string.base": "Description must be a string",
        "string.min": "Description must be a minimum of 10 characters",
    }),
    category: joi_1.default.string().min(4).messages({
        "string.base": "Category must be a string",
        "string.min": "Category must be a minimum of 4 characters",
    }),
    isRoutine: joi_1.default.boolean().messages({
        "boolean.base": "isRoutine must be of type boolean",
    }),
    expected_completion_time: joi_1.default.date().iso().messages({
        "date.base": "'expected_date_of_completion' must be a valid date",
        "date.iso": "'expected_date_of_completion' must be in ISO date format",
    }),
    completed: joi_1.default
        .boolean()
        .messages({
        "boolean.base": "Completed must be of type boolean",
    })
        .required(),
    createdAt: joi_1.default
        .date()
        .iso()
        .messages({
        "date.base": "CreatedAt must be a valid date",
        "date.format": "CreatedAt must be in ISO 8601 format",
    })
        .required(),
    recurrence: joi_1.default.string().valid("daily", "weekly", "monthly").messages({
        "any.only": "Recurrence must be one of 'daily', 'weekly', or 'monthly'",
    }),
});
exports.validateTaskUpdateParam = validateTaskUpdateParam;
