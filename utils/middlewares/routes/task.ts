import { Request, Response, NextFunction } from "express";

const addTask = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json("Hello World!");
  } catch (err) {
    console.log("Something went wrong Creating task", err);
    next(err);
  }
};

export { addTask };
