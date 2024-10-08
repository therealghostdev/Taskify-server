/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import {
  validateUserReg,
  validateUserLogin,
  validateTask,
  validateTaskQuery,
  validateTaskUpdate,
  validateTaskUpdateParam,
} from "../schema";
import { userSession, TaskDocument } from "../../../types";
import user from "../../../../models/user";
import dailyTasks from "../../../../models/tasks/dailyTasks";
import { isSameDay, getWeekOfMonth } from "../../../functions/general";
import {
  updateWeeklyTasks,
  updateMonthlyTasks,
  updateYearlyTasks,
} from "../../../functions/tasks";

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

const sortTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user as userSession;
    const foundUser = await user
      .findOne({ userName: currentUser.username })
      .populate("tasks");
    if (!foundUser) return next();

    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday is 0, Monday is 1, etc.
    const weekOfMonth = getWeekOfMonth(today);
    const month = today.getMonth() + 1; // January is 0
    const year = today.getFullYear();

    const tasks = foundUser.tasks as unknown as TaskDocument[];

    // Ensure we have today's task entry in DailyTasks
    let DailyTasks = await dailyTasks.findOne({ date: today });
    if (!DailyTasks) {
      DailyTasks = await dailyTasks.create({
        date: today,
        amount: 0,
        day: dayOfWeek,
        minutes: 0,
      });
    }

    // Update daily task counts and minutes for completed tasks
    let dailyMinutes = 0;
    let completedTaskCount = 0;
    let latestTaskDate = new Date(0);

    const unCountedTasks = tasks.filter(
      (task) => task.completed && !task.isCounted
    );
    const totalDuration = unCountedTasks.reduce(
      (acc, task) => acc + (task.duration || 0),
      0
    );

    for (const task of tasks) {
      const taskCreatedAt = new Date(task.createdAt);

      if (
        isSameDay(taskCreatedAt, today) &&
        task.completed &&
        !task.isCounted
      ) {
        task.isCounted = true;
        await task.save();

        if (taskCreatedAt > latestTaskDate) {
          latestTaskDate = taskCreatedAt;
        }
      }
    }

    completedTaskCount += unCountedTasks.length;
    dailyMinutes += totalDuration;

    // Update DailyTasks with current counts
    DailyTasks.amount = completedTaskCount;
    DailyTasks.minutes = dailyMinutes;
    await DailyTasks.save();

    // Weekly, Monthly, and Yearly Task Updates
    await updateWeeklyTasks(
      dayOfWeek,
      dailyMinutes,
      completedTaskCount,
      latestTaskDate,
      foundUser
    );
    await updateMonthlyTasks(weekOfMonth, foundUser, latestTaskDate);
    await updateYearlyTasks(month, latestTaskDate, foundUser, year);

    next();
  } catch (err) {
    console.error("Error in SortTasks middleware:", err);
    next(err);
  }
};

export {
  validateRegisterRequest,
  validateLoginRequest,
  validateTasksRequest,
  validateTasksRequestQparam,
  validateTasksUpdateRequestBody,
  validateTasksUpdateRequestQparam,
  taskTimeValidator,
  sortTasks,
};
