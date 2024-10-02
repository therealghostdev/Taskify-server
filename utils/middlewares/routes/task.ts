import { Request, Response, NextFunction } from "express";
import task from "../../../models/tasks/task";
import user from "../../../models/user";
import { userSession } from "../../types";

const addTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, priority, category, expected_completion_time } =
      req.body;

    const formatted_expected_completion_time = new Date(
      expected_completion_time
    ).toISOString();

    const currentUser = req.user as userSession | undefined;
    const foundUser = await user.findOne({ userName: currentUser?.username });
    console.log("req,user", req.user);
    console.log("Logged in user", currentUser);
    console.log("Found user:", foundUser);

    if (!foundUser) return res.status(404).json({ message: "User not found" });

    const newTask = new task({
      name,
      description,
      priority,
      category,
      expected_completion_time: formatted_expected_completion_time,
      createdAt: Date.now(),
      user: foundUser._id,
    });

    await newTask.save();

    res.status(201).json({ message: "Task creation sucessful" });
  } catch (err) {
    console.log("Something went wrong Creating task", err);
    next(err);
  }
};

const getTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filter_by_date, status } = req.query;

    const currentUser = req.user as userSession;

    const foundUser = await user.findOne({ userName: currentUser.username });

    if (!foundUser) return res.status(404).json({ message: "User not found" });

    let completed = false;
    if (status && status !== "") {
      completed = status === "complete";
    }

    const selectedDate = new Date(filter_by_date as string);
    const foundTask = await task.find({
      user: foundUser._id,
      createdAt: {
        $gte: new Date(selectedDate.setUTCHours(0, 0, 0, 0)),
        $lt: new Date(selectedDate.setUTCHours(23, 59, 59, 999)),
      },
      completed,
    });

    if (!foundTask || foundTask.length === 0)
      return res.status(404).json({ message: "task not found" });
    res.status(200).json({ message: "Successful", data: foundTask });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export { addTask, getTask };
