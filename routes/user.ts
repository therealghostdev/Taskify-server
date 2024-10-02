import express, { NextFunction, Request, Response, Router } from "express";
import { validateAuthentication } from "../utils/middlewares/routes/login&register";
import { csrfMiddleware } from "../config/csrf-csrf";
import { addTask } from "../utils/middlewares/routes/task";

export const userRoute: Router = express.Router();

userRoute.post("/add", validateAuthentication, csrfMiddleware, addTask);

userRoute.get(
  "/add",
  validateAuthentication,
  csrfMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json("Hello");
    } catch (err) {
      next(err);
    }
  }
);
