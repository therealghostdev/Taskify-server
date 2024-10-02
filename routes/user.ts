import express, { Router } from "express";
import { validateAuthentication } from "../utils/middlewares/routes/login&register";
import { csrfMiddleware } from "../config/csrf-csrf";
import { addTask, getTask } from "../utils/middlewares/routes/task";
import {
  validateTasksRequest,
  validateTasksRequestQparam,
} from "../utils/middlewares/validators/functions";

export const userRoute: Router = express.Router();

userRoute.post(
  "/task",
  validateAuthentication,
  csrfMiddleware,
  validateTasksRequest,
  addTask
);

userRoute.get(
  "/task",
  validateAuthentication,
  csrfMiddleware,
  validateTasksRequestQparam,
  getTask
);
