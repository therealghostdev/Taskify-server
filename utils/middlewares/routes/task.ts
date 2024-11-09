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

    if (
      !filter_by_date ||
      isNaN(new Date(filter_by_date as string).getTime())
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or missing date filter" });
    }

    const selectedDate = new Date(filter_by_date as string);
    const startOfDay = new Date(
      Date.UTC(
        selectedDate.getUTCFullYear(),
        selectedDate.getUTCMonth(),
        selectedDate.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );
    const endOfDay = new Date(
      Date.UTC(
        selectedDate.getUTCFullYear(),
        selectedDate.getUTCMonth(),
        selectedDate.getUTCDate(),
        23,
        59,
        59,
        998 // Prevent overlap with next day midnight
      )
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      user: foundUser._id,
      $or: [
        { createdAt: { $gte: startOfDay, $lt: endOfDay } },
        { expected_completion_time: { $gte: startOfDay, $lt: endOfDay } },
      ],
    };

    if (status === "complete" || status === "incomplete") {
      query.completed = status === "complete";
    }

    const foundTask = await task.find(query).exec();

    if (!foundTask || foundTask.length === 0)
      return res.status(404).json({ message: "Task not found" });

    const cached = await getCacheTaskData(foundUser.tasks.toString());
    if (cached && foundUser.tasks.length === cached.length)
      return res.status(200).json({ message: "Successful", data: cached });

    await cacheTaskData(foundUser.tasks.toString(), JSON.stringify(foundTask));
    res.status(200).json({ message: "Successful", data: foundTask });
  } catch (err) {
    console.error("Error in getTask function:", err);
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
      completedAt,
      onFocus,
      priority,
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
      priority: queryPriority,
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

    const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    const givenValues: PartialTaskUpdate = {};
    if (name) givenValues.name = name;
    if (category) givenValues.category = category;
    if (priority) givenValues.priority = Number(priority);
    if (expected_completion_time) {
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
      const completedTime = new Date(completedAt).getTime();
      if (typeof completed === "string") {
        if (
          (stringToBoolean(completed) === true && !duration) ||
          (stringToBoolean(completed) === true && duration <= 0) ||
          (stringToBoolean(completed) === true && !completedAt) ||
          (stringToBoolean(completed) === true && isNaN(completedTime))
        ) {
          return res.status(400).json({
            message:
              "Task duration field unset, value 0, invalaid or completedAt value is missing or invalid",
          });
        } else {
          givenValues.completed = stringToBoolean(completed);
        }
      } else if (typeof completed === "boolean") {
        if (
          (completed === true && !duration) ||
          (completed === true && duration <= 0) ||
          (completed === true && !completedAt) ||
          (completed === true && isNaN(completedTime))
        ) {
          return res.status(400).json({
            message:
              "Task duration field unset, value 0, invalaid or completedAt value is missing or invalid",
          });
        } else {
          givenValues.completed = completed;
        }
      }
    }
    if (completedAt) {
      if (isoDateTimeRegex.test(completedAt)) {
        const time = new Date(completedAt).getTime();
        if (!isNaN(time)) {
          givenValues.completedAt = completedAt;
        } else {
          return res.status(400).json({
            message:
              "CompletedAt field in request body missing a time value or invalid",
          });
        }
      } else {
        return res.status(400).json({
          message:
            "CompletedAt field in request body is invalid (Time value likely missing)",
        });
      }
    }

    if (
      onFocus &&
      (typeof onFocus === "boolean" || typeof onFocus === "string")
    ) {
      if (typeof onFocus === "string") {
        givenValues.onFocus = stringToBoolean(onFocus);
      } else {
        if (typeof onFocus === "boolean") {
          givenValues.onFocus = onFocus;
        }
      }
    }

    const searchCriteria: TaskSearchCriteria = {};
    searchCriteria.user = foundUser._id;
    if (queryName && typeof queryName === "string") {
      searchCriteria.name = { $regex: new RegExp(queryName, "i") };
    }
    if (queryPriority) searchCriteria.priority = Number(queryPriority);
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
      return res.status(403).json({
        message: "cannot update completed task",
      });

    if (givenValues.onFocus && foundTask.onFocus)
      return res
        .status(403)
        .json({ message: "cannot update onFocus field twice" });

    const now = new Date();
    const completedAtDate = new Date(completedAt);
    const createdAtDate = new Date(foundTask.createdAt);
    const expectedCompletionDate = new Date(foundTask.expected_completion_time);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    const twentyFourHoursAfterExpected = new Date(
      expectedCompletionDate.getTime() + 24 * 60 * 60 * 1000
    );

  //   console.log('Debug times:', {
  //     currentTime: now.toISOString(),
  //     completionTime: completedAtDate.toISOString(),
  //     fiveMinutesAhead: fiveMinutesFromNow.toISOString()
  // });

    if (completedAt && completedAtDate < createdAtDate) {
      return res.status(403).json({
        message:
          "completion date cannot preceed creation date use a day in the future for 'completedAt field'",
      });
    }

    if (completedAtDate > fiveMinutesFromNow) {
      return res.status(403).json({
        message: "Completion date cannot be too far in the future",
      });
    }

    if (completedAtDate > twentyFourHoursAfterExpected) {
      return res.status(403).json({
        message:
          "Task cannot be completed more than 24 hours after the expected completion time",
      });
    }

    if (givenValues.priority && isNaN(givenValues.priority)) {
      return res.status(400).json({
        message: "priority value is invalid",
      });
    }

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
    searchCriteria.user = foundUser._id;
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
