import express, { NextFunction, Request, Response, Router } from "express";

export const userRoute: Router = express.Router();

userRoute.post("/add", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json("Hello");
  } catch (err) {
    next(err);
  }
});

userRoute.get("/add", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json("Hello");
  } catch (err) {
    next(err);
  }
});
