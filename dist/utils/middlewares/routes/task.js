"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTask = exports.addTask = void 0;
const task_1 = __importDefault(require("../../../models/tasks/task"));
const user_1 = __importDefault(require("../../../models/user"));
const authentication_1 = require("../../functions/authentication");
const general_1 = require("../../functions/general");
const date_fns_1 = require("date-fns");
const addTask = async (req, res, next) => {
    try {
        const { name, description, priority, category, expected_completion_time } = req.body;
        const currentUser = req.user;
        const foundUser = await user_1.default.findOne({ userName: currentUser?.username });
        if (!foundUser)
            return res.status(404).json({ message: "User not found" });
        const newTask = new task_1.default({
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
    }
    catch (err) {
        console.log("Something went wrong Creating task", err);
        next(err);
    }
};
exports.addTask = addTask;
const getTask = async (req, res, next) => {
    try {
        const { filter_by_date, status } = req.query;
        const currentUser = req.user;
        const foundUser = await user_1.default.findOne({ userName: currentUser.username });
        if (!foundUser)
            return res.status(404).json({ message: "User not found" });
        const selectedDate = new Date(filter_by_date);
        const startOfDay = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 23, 59, 59, 998 // Prevent overlap with next day midnight
        ));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query = {
            user: foundUser._id,
            $or: [
                { createdAt: { $gte: startOfDay, $lt: endOfDay } },
                { expected_completion_time: { $gte: startOfDay, $lt: endOfDay } },
                { isRoutine: true },
            ],
        };
        if (status === "complete" || status === "incomplete") {
            query.completed = status === "complete";
        }
        const foundTasks = await task_1.default.find(query).exec();
        const dailyRecurringTask = foundTasks.filter((task) => {
            const taskCreatedDate = new Date(task.createdAt);
            // Reset time to 00:00:00 for both dates
            taskCreatedDate.setHours(0, 0, 0, 0);
            const selectedDateWithTime = new Date(selectedDate);
            selectedDateWithTime.setHours(0, 0, 0, 0);
            if (task.isRoutine && task.recurrence === "daily") {
                return taskCreatedDate <= selectedDateWithTime;
            }
            return false;
        });
        const weeklyRecurringTask = foundTasks.filter((task) => {
            const taskCreatedDate = new Date(task.createdAt);
            // Reset time to 00:00:00 for both dates
            taskCreatedDate.setHours(0, 0, 0, 0);
            const selectedDateWithTime = new Date(selectedDate);
            selectedDateWithTime.setHours(0, 0, 0, 0);
            if (task.isRoutine && task.recurrence === "weekly") {
                const dayDifference = Math.floor((selectedDateWithTime.getTime() - taskCreatedDate.getTime()) /
                    (1000 * 60 * 60 * 24));
                return dayDifference >= 0 && dayDifference % 7 === 0;
            }
            return false;
        });
        const monthlyRecurringTask = foundTasks.filter((task) => {
            const taskCreatedDate = new Date(task.createdAt);
            // Reset time to 00:00:00 for both dates
            taskCreatedDate.setHours(0, 0, 0, 0);
            const selectedDateWithTime = new Date(selectedDate);
            selectedDateWithTime.setHours(0, 0, 0, 0);
            if (task.isRoutine && task.recurrence === "monthly") {
                return (taskCreatedDate.getUTCDate() === selectedDateWithTime.getUTCDate() &&
                    selectedDateWithTime >= taskCreatedDate);
            }
            return false;
        });
        const notRoutineTask = foundTasks.filter((task) => !task.isRoutine);
        const foundValues = [
            ...(notRoutineTask.length > 0 ? notRoutineTask : []),
            ...(dailyRecurringTask.length > 0 ? dailyRecurringTask : []),
            ...(weeklyRecurringTask.length > 0 ? weeklyRecurringTask : []),
            ...(monthlyRecurringTask.length > 0 ? monthlyRecurringTask : []),
        ];
        if (!foundValues || foundValues.length === 0)
            return res.status(404).json({ message: "Task not found" });
        const cached = await (0, authentication_1.getCacheTaskData)(foundUser.tasks.toString());
        if (cached && foundUser.tasks.length === cached.length)
            return res.status(200).json({ message: "Successful", data: cached });
        await (0, authentication_1.cacheTaskData)(foundUser.tasks.toString(), JSON.stringify(foundValues));
        res.status(200).json({ message: "Successful", data: foundValues });
    }
    catch (err) {
        console.error("Error in getTask function:", err);
        next(err);
    }
};
exports.getTask = getTask;
const updateTask = async (req, res, next) => {
    try {
        const { name, category, expected_completion_time, description, recurrence, isRoutine, duration, completed, completedAt, onFocus, priority, } = req.body;
        const { name: queryName, category: queryCategory, expected_completion_time: queryExpected_completion_time, description: queryDescription, recurrence: queryRecurrence, isRoutine: queryIsRoutine, completed: queryCompleted, createdAt: queryCreatedAt, priority: queryPriority, } = req.query;
        const currentUser = req.user;
        const foundUser = await user_1.default.findOne({ userName: currentUser.username });
        if (!foundUser)
            return res.status(404).json({ message: "User not found" });
        const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        const givenValues = {};
        if (name)
            givenValues.name = name;
        if (category)
            givenValues.category = category;
        if (priority)
            givenValues.priority = Number(priority);
        if (expected_completion_time) {
            if (isoDateTimeRegex.test(expected_completion_time)) {
                const time = new Date(expected_completion_time).getTime();
                if (!isNaN(time)) {
                    givenValues.expected_completion_time = expected_completion_time;
                }
                else {
                    return res.status(400).json({
                        message: "Invalid time value in expected_completion_time in the request body",
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Invalid date format for expected_completion_time. Expected ISO 8601 format (YYYY-MM-DDTHH:MM:SS.SSSZ).",
                });
            }
        }
        if (description)
            givenValues.description = description;
        if (recurrence)
            givenValues.recurrence = recurrence;
        if (duration &&
            (completed === "true" ||
                (typeof completed === "boolean" && completed === true)))
            givenValues.duration = duration;
        if (typeof isRoutine === "boolean" || typeof isRoutine === "string") {
            if (typeof isRoutine === "string") {
                givenValues.isRoutine = (0, general_1.stringToBoolean)(isRoutine);
            }
            else {
                givenValues.isRoutine = isRoutine;
            }
        }
        if (typeof completed === "boolean" || typeof completed === "string") {
            const completedTime = new Date(completedAt).getTime();
            if (typeof completed === "string") {
                if (((0, general_1.stringToBoolean)(completed) === true && !duration) ||
                    ((0, general_1.stringToBoolean)(completed) === true && duration <= 0) ||
                    ((0, general_1.stringToBoolean)(completed) === true && !completedAt) ||
                    ((0, general_1.stringToBoolean)(completed) === true && isNaN(completedTime))) {
                    return res.status(400).json({
                        message: "Task duration field unset, value 0, invalaid or completedAt value is missing or invalid",
                    });
                }
                else {
                    givenValues.completed = (0, general_1.stringToBoolean)(completed);
                }
            }
            else if (typeof completed === "boolean") {
                if ((completed === true && !duration) ||
                    (completed === true && duration <= 0) ||
                    (completed === true && !completedAt) ||
                    (completed === true && isNaN(completedTime))) {
                    return res.status(400).json({
                        message: "Task duration field unset, value 0, invalaid or completedAt value is missing or invalid",
                    });
                }
                else {
                    givenValues.completed = completed;
                }
            }
        }
        if (completedAt) {
            if (isoDateTimeRegex.test(completedAt)) {
                const time = new Date(completedAt).getTime();
                if (!isNaN(time)) {
                    givenValues.completedAt = completedAt;
                }
                else {
                    return res.status(400).json({
                        message: "CompletedAt field in request body missing a time value or invalid",
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "CompletedAt field in request body is invalid (Time value likely missing)",
                });
            }
        }
        if (onFocus &&
            (typeof onFocus === "boolean" || typeof onFocus === "string")) {
            if (typeof onFocus === "string") {
                givenValues.onFocus = (0, general_1.stringToBoolean)(onFocus);
            }
            else {
                if (typeof onFocus === "boolean") {
                    givenValues.onFocus = onFocus;
                }
            }
        }
        const searchCriteria = {};
        searchCriteria.user = foundUser._id;
        if (queryName && typeof queryName === "string") {
            searchCriteria.name = { $regex: new RegExp(queryName, "i") };
        }
        if (queryPriority)
            searchCriteria.priority = Number(queryPriority);
        if (queryCategory && typeof queryCategory === "string") {
            searchCriteria.category = queryCategory;
        }
        if (queryExpected_completion_time &&
            typeof queryExpected_completion_time === "string") {
            const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
            if (isoDateTimeRegex.test(queryExpected_completion_time)) {
                const time = new Date(queryExpected_completion_time).getTime();
                if (!isNaN(time)) {
                    searchCriteria.expected_completion_time =
                        queryExpected_completion_time;
                }
                else {
                    return res.status(400).json({
                        message: "Invalid time value in expected_completion_time in the search query",
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Invalid date format for expected_completion_time in request query. Expected ISO 8601 format (YYYY-MM-DDTHH:MM:SS.SSSZ).",
                });
            }
        }
        if (queryDescription && typeof queryDescription === "string") {
            searchCriteria.description = {
                $regex: new RegExp(queryDescription, "i"),
            };
        }
        if (queryRecurrence && typeof queryRecurrence === "string") {
            searchCriteria.recurrence = queryRecurrence;
        }
        if (typeof queryIsRoutine === "boolean" ||
            typeof queryIsRoutine === "string") {
            if (typeof queryIsRoutine === "string") {
                searchCriteria.completed = (0, general_1.stringToBoolean)(queryIsRoutine);
            }
            else {
                searchCriteria.isRoutine = queryIsRoutine;
            }
        }
        if (typeof queryCompleted === "boolean" ||
            typeof queryCompleted === "string") {
            if (typeof queryCompleted === "string") {
                searchCriteria.completed = (0, general_1.stringToBoolean)(queryCompleted);
            }
            else {
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
            }
            else {
                return res.status(400).json({
                    message: "Time value is missing on 'createdAt' in search query",
                });
            }
        }
        const foundTask = await task_1.default.findOne(searchCriteria);
        if (!foundTask)
            return res.status(404).json({ message: "Task not found" });
        if (foundTask.completed)
            return res.status(403).json({
                message: "cannot update completed task",
            });
        if (givenValues.onFocus && foundTask.onFocus)
            return res
                .status(403)
                .json({ message: "cannot update onFocus field twice" });
        const userTimezone = foundUser.timezone;
        const now = new Date();
        const completedAtDate = new Date(completedAt);
        const completedAtDateInUserTz = new Date(completedAtDate.toLocaleDateString("en-GB", { timeZone: userTimezone }));
        const createdAtDate = new Date(foundTask.createdAt);
        const expectedCompletionDate = new Date(foundTask.expected_completion_time);
        const fiveMinutesFromNow = (0, date_fns_1.addMinutes)(now, 5);
        const fiveMinutesFromNowInUserTz = new Date(fiveMinutesFromNow.toLocaleDateString("en-GB", { timeZone: userTimezone }));
        const twentyFourHoursAfterExpected = new Date(expectedCompletionDate.getTime() + 24 * 60 * 60 * 1000);
        const twentyFourHoursAfterExpectedInUserTz = new Date(twentyFourHoursAfterExpected.toLocaleDateString("en-GB", {
            timeZone: userTimezone,
        }));
        if (completedAt && completedAtDate < createdAtDate) {
            return res.status(403).json({
                message: "completion date cannot preceed creation date use a day in the future for 'completedAt field'",
            });
        }
        if (completedAtDateInUserTz &&
            (0, date_fns_1.isAfter)(completedAtDateInUserTz, fiveMinutesFromNowInUserTz)) {
            return res.status(403).json({
                message: "Completion date cannot be too far in the future.",
            });
        }
        if (completedAtDateInUserTz &&
            (0, date_fns_1.isAfter)(completedAtDateInUserTz, twentyFourHoursAfterExpectedInUserTz)) {
            return res.status(403).json({
                message: "Task cannot be completed more than 24 hours after the expected completion time.",
            });
        }
        if (givenValues.priority && isNaN(givenValues.priority)) {
            return res.status(400).json({
                message: "priority value is invalid",
            });
        }
        if (givenValues.completed && foundTask.isRoutine) {
            return res.status(403).json({
                message: "This task is a routine, remove from routine and try again!",
            });
        }
        await (0, authentication_1.invalidateCacheTaskData)(foundUser.tasks.toString());
        await task_1.default.updateOne({ _id: foundTask._id }, { $set: givenValues });
        await foundUser.updateTaskCounts();
        res.status(200).json({ message: "Update action successful" });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res, next) => {
    try {
        const { name: queryName, category: queryCategory, expected_completion_time: queryExpected_completion_time, description: queryDescription, recurrence: queryRecurrence, isRoutine: queryIsRoutine, completed: queryCompleted, createdAt: queryCreatedAt, } = req.query;
        const currentUser = req.user;
        const foundUser = await user_1.default.findOne({ userName: currentUser.username });
        if (!foundUser)
            return res.status(404).json({ message: "User not found" });
        const searchCriteria = {};
        searchCriteria.user = foundUser._id;
        if (queryName && typeof queryName === "string") {
            searchCriteria.name = { $regex: new RegExp(queryName, "i") };
        }
        if (queryCategory && typeof queryCategory === "string") {
            searchCriteria.category = queryCategory;
        }
        if (queryExpected_completion_time &&
            typeof queryExpected_completion_time === "string") {
            const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
            if (isoDateTimeRegex.test(queryExpected_completion_time)) {
                const time = new Date(queryExpected_completion_time).getTime();
                if (!isNaN(time)) {
                    searchCriteria.expected_completion_time =
                        queryExpected_completion_time;
                }
                else {
                    return res.status(400).json({
                        message: "Invalid time value in expected_completion_time in the search query",
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Invalid date format for expected_completion_time in request query. Expected ISO 8601 format (YYYY-MM-DDTHH:MM:SS.SSSZ).",
                });
            }
        }
        if (queryDescription && typeof queryDescription === "string") {
            searchCriteria.description = {
                $regex: new RegExp(queryDescription, "i"),
            };
        }
        if (queryRecurrence && typeof queryRecurrence === "string") {
            searchCriteria.recurrence = queryRecurrence;
        }
        if (typeof queryIsRoutine === "boolean" ||
            typeof queryIsRoutine === "string") {
            if (typeof queryIsRoutine === "string") {
                searchCriteria.completed = (0, general_1.stringToBoolean)(queryIsRoutine);
            }
            else {
                searchCriteria.isRoutine = queryIsRoutine;
            }
        }
        if (typeof queryCompleted === "boolean" ||
            typeof queryCompleted === "string") {
            if (typeof queryCompleted === "string") {
                searchCriteria.completed = (0, general_1.stringToBoolean)(queryCompleted);
            }
            else {
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
            }
            else {
                return res.status(400).json({
                    message: "Time value is missing on 'createdAt' in search query",
                });
            }
        }
        const foundTask = await task_1.default.findOne(searchCriteria);
        if (!foundTask)
            return res.status(404).json({ message: "Task not found" });
        if (foundTask.completed)
            return res.status(409).json({
                message: "cannot delete a completed task",
            });
        await task_1.default.deleteOne({ _id: foundTask._id });
        await user_1.default.findByIdAndUpdate(foundUser._id, {
            $pull: { tasks: foundTask._id },
        });
        await foundUser.updateTaskCounts();
        res.status(200).json({ message: "Delete action successful" });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
};
exports.deleteTask = deleteTask;
