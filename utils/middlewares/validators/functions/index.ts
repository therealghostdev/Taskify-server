import { Request, Response, NextFunction } from "express";
import { validateUserReg, validateUserLogin } from "../schema";

const validateRegisterRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = validateUserReg.validate(req.body);

  if (error) {
    return res.status(400).json(error.details[0].message);
  }

  next();
};

const validateLoginRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = validateUserLogin.validate(req.body);

  if (error) return res.status(400).json(error.details[0].message);

  next();
};

export { validateRegisterRequest, validateLoginRequest };
