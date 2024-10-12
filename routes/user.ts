import express, { Router } from "express";
import { validateAuthentication } from "../utils/middlewares/routes/login&register";
import { csrfMiddleware } from "../config/csrf-csrf";
import {
  addTask,
  getTask,
  updateTask,
  deleteTask,
} from "../utils/middlewares/routes/task";
import {
  validateTasksRequest,
  validateTasksRequestQparam,
  validateTasksUpdateRequestBody,
  validateTasksUpdateRequestQparam,
  taskTimeValidator,
  sortTasks,
  validateUpdateUserTokenBody,
} from "../utils/middlewares/validators/functions";
import { updateUserToken } from "../utils/middlewares/routes/userToken";

export const userRoute: Router = express.Router();

userRoute.post(
  "/task",
  validateAuthentication,
  csrfMiddleware,
  validateTasksRequest,
  taskTimeValidator,
  addTask
);

userRoute.get(
  "/task",
  validateAuthentication,
  csrfMiddleware,
  validateTasksRequestQparam,
  sortTasks,
  getTask
);

userRoute.put(
  "/task",
  validateAuthentication,
  csrfMiddleware,
  validateTasksUpdateRequestBody,
  validateTasksUpdateRequestQparam,
  taskTimeValidator,
  updateTask
);

userRoute.delete(
  "/task",
  validateAuthentication,
  csrfMiddleware,
  validateTasksUpdateRequestQparam,
  deleteTask
);

userRoute.put(
  "/update_user_token",
  validateAuthentication,
  csrfMiddleware,
  validateUpdateUserTokenBody,
  updateUserToken
);
