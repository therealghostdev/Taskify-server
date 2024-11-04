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
        let completed = false;
        if (status && status !== "") {
            completed = status === "complete";
        }
        const selectedDate = new Date(filter_by_date);
        const foundTask = await task_1.default.find({
            user: foundUser._id,
            completed,
            $or: [
                {
                    createdAt: {
                        $gte: new Date(selectedDate.setUTCHours(0, 0, 0, 0)),
                        $lt: new Date(selectedDate.setUTCHours(23, 59, 59, 999)),
                    },
                },
                {
                    expected_completion_time: {
                        $gte: new Date(selectedDate.setUTCHours(0, 0, 0, 0)),
                        $lt: new Date(selectedDate.setUTCHours(23, 59, 59, 999)),
                    },
                },
            ],
        });
        if (!foundTask || foundTask.length === 0)
            return res.status(404).json({ message: "task not found" });
        const cached = await (0, authentication_1.getCacheTaskData)(foundUser.tasks.toString());
        if (cached && foundUser.tasks.length === cached.length)
            return res.status(200).json({ message: "Successful", data: cached });
        await (0, authentication_1.cacheTaskData)(foundUser.tasks.toString(), JSON.stringify(foundTask));
        res.status(200).json({ message: "Successful", data: foundTask });
    }
    catch (err) {
        console.log(err);
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
        const now = new Date();
        const completedAtDate = new Date(completedAt);
        const createdAtDate = new Date(foundTask.createdAt);
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
        if (completedAt && completedAtDate < createdAtDate) {
            return res.status(403).json({
                message: "completion date cannot preceed creation date use a day in the future for 'completedAt field'",
            });
        }
        if (completedAtDate > fiveMinutesFromNow) {
            return res.status(403).json({
                message: "Completion date cannot be too far in the future",
            });
        }
        if (givenValues.priority && isNaN(givenValues.priority)) {
            return res.status(400).json({
                message: "priority value is invalid",
            });
        }
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
