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

export { addTask };
