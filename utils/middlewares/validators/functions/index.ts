import { Request, Response, NextFunction } from "express";
import {
  validateUserReg,
  validateUserLogin,
  validateTask,
  validateTaskQuery,
  validateTaskUpdate,
  validateTaskUpdateParam,
} from "../schema";

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

const validateTasksRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = validateTask.validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

const validateTasksRequestQparam = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = validateTaskQuery.validate(req.query);

  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

const validateTasksUpdateRequestBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = validateTaskUpdate.validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

const validateTasksUpdateRequestQparam = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = validateTaskUpdateParam.validate(req.query);

  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

const taskTimeValidator = (req: Request, res: Response, next: NextFunction) => {
  console.log("This function ran");
  
  const { expected_completion_time } = req.body;
  const expectedTime = new Date(expected_completion_time); // Already in UTC
  const currentTime = new Date(); // Current time, local but used as UTC in .getTime()

  // console.log("Expected time (UTC):", expectedTime.toUTCString());
  // console.log("Current time (UTC):", currentTime.toUTCString());

  if (isNaN(expectedTime.getTime())) {
    return res.status(400).json({ message: "Invalid time format" });
  }

  const timeDifferenceMinutes = Math.round(
    (expectedTime.getTime() - currentTime.getTime()) / 60000
  );

  // console.log("Time difference (minutes):", timeDifferenceMinutes);

  if (timeDifferenceMinutes <= 0) {
    return res.status(400).json({
      message: "Time value is unacceptable. Please use a time in the future.",
      expected: expectedTime.toISOString(),
      current: currentTime.toISOString(),
      differenceMinutes: timeDifferenceMinutes,
    });
  }

  next();
};

export {
  validateRegisterRequest,
  validateLoginRequest,
  validateTasksRequest,
  validateTasksRequestQparam,
  validateTasksUpdateRequestBody,
  validateTasksUpdateRequestQparam,
  taskTimeValidator,
};
