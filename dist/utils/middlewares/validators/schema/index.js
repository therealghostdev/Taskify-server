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
    expected_completion_time: joi_1.default.date().iso().min("now").required().messages({
        "date.base": "'expected_date_of_completion' must be a valid date => (request body Error)",
        "date.iso": "'expected_date_of_completion' in request body must be in ISO date format => (request body Error)",
        "date.min": "'expected_completion_time' cannot be in the past => (request body Error)",
        "any.required": "'expected_completion_time' is required",
    }),
});
exports.validateTask = validateTask;
const validateTaskQuery = joi_1.default.object({
    filter_by_date: joi_1.default.date().iso().required(),
    status: joi_1.default.string().valid("complete", "incomplete"),
});
exports.validateTaskQuery = validateTaskQuery;
const validateTaskUpdate = joi_1.default.object({
    name: joi_1.default.string().min(3).messages({
        "string.base": "Task name must be a string => (request body Error)",
        "string.min": "Task name must be 3 characters or more => (request body Error)",
    }),
    description: joi_1.default.string().min(10).messages({
        "string.base": "Description must be a string => (request body Error)",
        "string.min": "Description must be a minimum of 10 characters => (request body Error)",
    }),
    category: joi_1.default.string().min(4).messages({
        "string.base": "Category must be a string => (request body Error)",
        "string.min": "Category must be a minimum of 4 characters => (request body Error)",
    }),
    duration: joi_1.default.number().min(1).messages({
        "number.base": "Duration must be a number => (request body error)",
        "number.min": "Duration must be value of 1 or higher",
    }),
    isRoutine: joi_1.default.boolean().messages({
        "boolean.base": "isRoutine must be of type boolean => (request body Error)",
    }),
    completed: joi_1.default.boolean().messages({
        "boolean.base": "completed must be of type boolean => (request body Error)",
    }),
    expected_completion_time: joi_1.default.date().iso().min("now").messages({
        "date.base": "'expected_date_of_completion' must be a valid date => (request body Error)",
        "date.iso": "'expected_date_of_completion' in request body must be in ISO date format => (request body Error)",
        "date.min": "'expected_completion_time' cannot be in the past => (request body Error)",
    }),
    recurrence: joi_1.default.string().valid("daily", "weekly", "monthly").messages({
        "any.only": "Recurrence must be one of 'daily', 'weekly', or 'monthly' => (request body Error)",
    }),
});
exports.validateTaskUpdate = validateTaskUpdate;
const validateTaskUpdateParam = joi_1.default.object({
    name: joi_1.default.string().min(3).required().messages({
        "string.base": "Task name must be a string",
        "string.min": "Task name must be 3 characters or more",
        "any.required": "Task name is required in search query",
    }),
    description: joi_1.default.string().min(10).messages({
        "string.base": "Description must be a string => (search query Error)",
        "string.min": "Description must be a minimum of 10 characters => (search query Error)",
    }),
    category: joi_1.default.string().min(4).messages({
        "string.base": "Category must be a string => (search query Error)",
        "string.min": "Category must be a minimum of 4 characters => (search query Error)",
    }),
    isRoutine: joi_1.default.boolean().messages({
        "boolean.base": "isRoutine must be of type boolean => (search query Error)",
    }),
    expected_completion_time: joi_1.default.date().iso().messages({
        "date.base": "'expected_completion_time' in request query must be a valid date => (search query Error)",
        "date.iso": "'expected_completion_time' in request query must be in ISO 8601 date format (e.g., YYYY-MM-DDTHH:mm:ss.sssZ) => (search query Error)",
    }),
    completed: joi_1.default
        .boolean()
        .messages({
        "boolean.base": "Completed must be of type boolean => (search query Error)",
    })
        .required(),
    createdAt: joi_1.default
        .date()
        .iso()
        .messages({
        "date.base": "CreatedAt must be a valid date => (search query Error)",
        "date.format": "CreatedAt must be in ISO 8601 format => (search query Error)",
    })
        .required(),
    recurrence: joi_1.default.string().valid("daily", "weekly", "monthly").messages({
        "any.only": "Recurrence must be one of 'daily', 'weekly', or 'monthly' => (search query Error)",
    }),
});
exports.validateTaskUpdateParam = validateTaskUpdateParam;
