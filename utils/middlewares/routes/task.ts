import { Request, Response, NextFunction } from "express";
import task from "../../../models/tasks/task";
import user from "../../../models/user";
import { userSession, TaskType, RecurrenceType } from "../../types";
import {
  cacheTaskData,
  getCacheTaskData,
} from "../../functions/authentication";
import { stringToBoolean } from "../../functions/general";

const addTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, priority, category, expected_completion_time } =
      req.body;

    const currentUser = req.user as userSession | undefined;
    const foundUser = await user.findOne({ userName: currentUser?.username });

    if (!foundUser) return res.status(404).json({ message: "User not found" });

    const newTask = new task({
      name,
      description,
      priority,
      category,
      expected_completion_time,
      createdAt: Date.now(),
      user: foundUser._id,
    });

    await newTask.save();
    await newTask.addTaskToUser();
    await foundUser.updateTaskCounts();

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

    const cached = await getCacheTaskData(foundUser.tasks.toString());
    if (cached && foundUser.tasks.length === cached.length)
      return res.status(200).json({ message: "Successful", data: cached });

    await cacheTaskData(foundUser.tasks.toString(), JSON.stringify(foundTask));
    res.status(200).json({ message: "Successful", data: foundTask });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      category,
      expected_completion_time,
      description,
      recurrence,
      isRoutine,
      duration,
      completed,
    } = req.body;

    const {
      name: queryName,
      category: queryCategory,
      expected_completion_time: queryExpected_completion_time,
      description: queryDescription,
      recurrence: queryRecurrence,
      isRoutine: queryIsRoutine,
      completed: queryCompleted,
      createdAt: queryCreatedAt,
    } = req.query;

    const currentUser = req.user as userSession;

    const foundUser = await user.findOne({ userName: currentUser.username });

    if (!foundUser) return res.status(404).json({ message: "User not found" });

    type PartialTaskUpdate = Partial<TaskType>;

    type TaskSearchCriteria = {
      [K in keyof TaskType]?:
        | TaskType[K]
        | { $regex: RegExp }
        | { $gte: Date; $lt: Date };
    };

    const givenValues: PartialTaskUpdate = {};
    if (name) givenValues.name = name;
    if (category) givenValues.category = category;
    if (expected_completion_time) {
      const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      if (isoDateTimeRegex.test(expected_completion_time)) {
        const time = new Date(expected_completion_time).getTime();
        if (!isNaN(time)) {
          givenValues.expected_completion_time = expected_completion_time;
        } else {
          return res.status(400).json({
            message:
              "Invalid time value in expected_completion_time in the request body",
          });
        }
      } else {
        return res.status(400).json({
          message:
            "Invalid date format for expected_completion_time. Expected ISO 8601 format (YYYY-MM-DDTHH:MM:SS.SSSZ).",
        });
      }
    }
    if (description) givenValues.description = description;
    if (recurrence) givenValues.recurrence = recurrence;
    if (
      duration &&
      (completed === "true" ||
        (typeof completed === "boolean" && completed === true))
    )
      givenValues.duration = duration;
    if (typeof isRoutine === "boolean" || typeof isRoutine === "string") {
      if (typeof isRoutine === "string") {
        givenValues.isRoutine = stringToBoolean(isRoutine);
      } else {
        givenValues.isRoutine = isRoutine;
      }
    }
    if (typeof completed === "boolean" || typeof completed === "string") {
      if (typeof completed === "string") {
        if ((stringToBoolean(completed) && !duration) || duration <= 0) {
          return res
            .status(400)
            .json({ message: "Task duration field unset, value 0 or invalid" });
        } else {
          givenValues.completed = stringToBoolean(completed);
        }
      } else if (typeof completed === "boolean") {
        if ((completed && !duration) || duration <= 0) {
          return res.status(400).json({
            message: "Task duration field unset, value 0 or invalaid",
          });
        } else {
          givenValues.completed = completed;
        }
      }
    }

    const searchCriteria: TaskSearchCriteria = {};
    if (queryName && typeof queryName === "string") {
      searchCriteria.name = { $regex: new RegExp(queryName, "i") };
    }
    if (queryCategory && typeof queryCategory === "string") {
      searchCriteria.category = queryCategory;
    }
    if (
      queryExpected_completion_time &&
      typeof queryExpected_completion_time === "string"
    ) {
      const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      if (isoDateTimeRegex.test(queryExpected_completion_time)) {
        const time = new Date(queryExpected_completion_time).getTime();
        if (!isNaN(time)) {
          searchCriteria.expected_completion_time =
            queryExpected_completion_time;
        } else {
          return res.status(400).json({
            message:
              "Invalid time value in expected_completion_time in the search query",
          });
        }
      } else {
        return res.status(400).json({
          message:
            "Invalid date format for expected_completion_time in request query. Expected ISO 8601 format (YYYY-MM-DDTHH:MM:SS.SSSZ).",
        });
      }
    }
    if (queryDescription && typeof queryDescription === "string") {
      searchCriteria.description = {
        $regex: new RegExp(queryDescription, "i"),
      };
    }
    if (queryRecurrence && typeof queryRecurrence === "string") {
      searchCriteria.recurrence = queryRecurrence as RecurrenceType;
    }
    if (
      typeof queryIsRoutine === "boolean" ||
      typeof queryIsRoutine === "string"
    ) {
      if (typeof queryIsRoutine === "string") {
        searchCriteria.completed = stringToBoolean(queryIsRoutine);
      } else {
        searchCriteria.isRoutine = queryIsRoutine;
      }
    }
    if (
      typeof queryCompleted === "boolean" ||
      typeof queryCompleted === "string"
    ) {
      if (typeof queryCompleted === "string") {
        searchCriteria.completed = stringToBoolean(queryCompleted);
      } else {
        searchCriteria.completed = queryCompleted;
      }
    }
    if (typeof queryCreatedAt === "string") {
      const date = new Date(queryCreatedAt);
      if (!isNaN(date.getTime())) {
        searchCriteria.createdAt = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999)),
        };
      } else {
        return res.status(400).json({
          message: "Time value is missing on 'createdAt' in search query",
        });
      }
    }

    const foundTask = await task.findOne(searchCriteria);

    if (!foundTask) return res.status(404).json({ message: "Task not found" });

    if (foundTask.completed)
      return res.status(409).json({
        message: "cannot update completed task",
      });

    await task.updateOne({ _id: foundTask._id }, { $set: givenValues });
    await foundUser.updateTaskCounts();

    res.status(200).json({ message: "Update action successful" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name: queryName,
      category: queryCategory,
      expected_completion_time: queryExpected_completion_time,
      description: queryDescription,
      recurrence: queryRecurrence,
      isRoutine: queryIsRoutine,
      completed: queryCompleted,
      createdAt: queryCreatedAt,
    } = req.query;

    const currentUser = req.user as userSession;

    const foundUser = await user.findOne({ userName: currentUser.username });

    if (!foundUser) return res.status(404).json({ message: "User not found" });

    type TaskSearchCriteria = {
      [K in keyof TaskType]?:
        | TaskType[K]
        | { $regex: RegExp }
        | { $gte: Date; $lt: Date };
    };

    const searchCriteria: TaskSearchCriteria = {};
    if (queryName && typeof queryName === "string") {
      searchCriteria.name = { $regex: new RegExp(queryName, "i") };
    }
    if (queryCategory && typeof queryCategory === "string") {
      searchCriteria.category = queryCategory;
    }
    if (
      queryExpected_completion_time &&
      typeof queryExpected_completion_time === "string"
    ) {
      const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      if (isoDateTimeRegex.test(queryExpected_completion_time)) {
        const time = new Date(queryExpected_completion_time).getTime();
        if (!isNaN(time)) {
          searchCriteria.expected_completion_time =
            queryExpected_completion_time;
        } else {
          return res.status(400).json({
            message:
              "Invalid time value in expected_completion_time in the search query",
          });
        }
      } else {
        return res.status(400).json({
          message:
            "Invalid date format for expected_completion_time in request query. Expected ISO 8601 format (YYYY-MM-DDTHH:MM:SS.SSSZ).",
        });
      }
    }
    if (queryDescription && typeof queryDescription === "string") {
      searchCriteria.description = {
        $regex: new RegExp(queryDescription, "i"),
      };
    }
    if (queryRecurrence && typeof queryRecurrence === "string") {
      searchCriteria.recurrence = queryRecurrence as RecurrenceType;
    }
    if (
      typeof queryIsRoutine === "boolean" ||
      typeof queryIsRoutine === "string"
    ) {
      if (typeof queryIsRoutine === "string") {
        searchCriteria.completed = stringToBoolean(queryIsRoutine);
      } else {
        searchCriteria.isRoutine = queryIsRoutine;
      }
    }
    if (
      typeof queryCompleted === "boolean" ||
      typeof queryCompleted === "string"
    ) {
      if (typeof queryCompleted === "string") {
        searchCriteria.completed = stringToBoolean(queryCompleted);
      } else {
        searchCriteria.completed = queryCompleted;
      }
    }
    if (typeof queryCreatedAt === "string") {
      const date = new Date(queryCreatedAt);
      if (!isNaN(date.getTime())) {
        searchCriteria.createdAt = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999)),
        };
      } else {
        return res.status(400).json({
          message: "Time value is missing on 'createdAt' in search query",
        });
      }
    }

    const foundTask = await task.findOne(searchCriteria);

    if (!foundTask) return res.status(404).json({ message: "Task not found" });

    if (foundTask.completed)
      return res.status(409).json({
        message: "cannot delete a completed task",
      });

    await task.deleteOne({ _id: foundTask._id });

    await user.findByIdAndUpdate(foundUser._id, {
      $pull: { tasks: foundTask._id },
    });

    await foundUser.updateTaskCounts();

    res.status(200).json({ message: "Delete action successful" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export { addTask, getTask, updateTask, deleteTask };
