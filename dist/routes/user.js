"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoute = void 0;
const express_1 = __importDefault(require("express"));
const login_register_1 = require("../utils/middlewares/routes/login&register");
const csrf_csrf_1 = require("../config/csrf-csrf");
const task_1 = require("../utils/middlewares/routes/task");
const functions_1 = require("../utils/middlewares/validators/functions");
exports.userRoute = express_1.default.Router();
exports.userRoute.post("/add", login_register_1.validateAuthentication, csrf_csrf_1.csrfMiddleware, functions_1.validateTasksRequest, task_1.addTask);
exports.userRoute.get("/add", login_register_1.validateAuthentication, csrf_csrf_1.csrfMiddleware, (req, res, next) => {
    try {
        res.status(200).json("Hello");
    }
    catch (err) {
        next(err);
    }
});
