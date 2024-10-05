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
exports.userRoute.post("/task", login_register_1.validateAuthentication, csrf_csrf_1.csrfMiddleware, functions_1.validateTasksRequest, task_1.addTask);
exports.userRoute.get("/task", login_register_1.validateAuthentication, csrf_csrf_1.csrfMiddleware, functions_1.validateTasksRequestQparam, task_1.getTask);
exports.userRoute.put("/task", login_register_1.validateAuthentication, csrf_csrf_1.csrfMiddleware, functions_1.validateTasksUpdateRequestBody, functions_1.validateTasksUpdateRequestQparam, task_1.updateTask);
exports.userRoute.delete("/task", login_register_1.validateAuthentication, csrf_csrf_1.csrfMiddleware, functions_1.validateTasksUpdateRequestQparam, task_1.deleteTask);
