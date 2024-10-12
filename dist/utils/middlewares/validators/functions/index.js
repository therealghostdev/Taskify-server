"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateUserTokenBody = exports.sortTasks = exports.taskTimeValidator = exports.validateTasksUpdateRequestQparam = exports.validateTasksUpdateRequestBody = exports.validateTasksRequestQparam = exports.validateTasksRequest = exports.validateLoginRequest = exports.validateRegisterRequest = void 0;
const schema_1 = require("../schema");
const user_1 = __importDefault(require("../../../../models/user"));
const dailyTasks_1 = __importDefault(require("../../../../models/tasks/dailyTasks"));
const general_1 = require("../../../functions/general");
const tasks_1 = require("../../../functions/tasks");
const validateRegisterRequest = (req, res, next) => {
    const { error } = schema_1.validateUserReg.validate(req.body);
    if (error) {
        return res.status(400).json(error.details[0].message);
    }
    next();
};
exports.validateRegisterRequest = validateRegisterRequest;
const validateLoginRequest = (req, res, next) => {
    const { error } = schema_1.validateUserLogin.validate(req.body);
    if (error)
        return res.status(400).json(error.details[0].message);
    next();
};
exports.validateLoginRequest = validateLoginRequest;
const validateTasksRequest = (req, res, next) => {
    const { error } = schema_1.validateTask.validate(req.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    next();
};
exports.validateTasksRequest = validateTasksRequest;
const validateTasksRequestQparam = (req, res, next) => {
    const { error } = schema_1.validateTaskQuery.validate(req.query);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    next();
};
exports.validateTasksRequestQparam = validateTasksRequestQparam;
const validateTasksUpdateRequestBody = (req, res, next) => {
    const { error } = schema_1.validateTaskUpdate.validate(req.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    next();
};
exports.validateTasksUpdateRequestBody = validateTasksUpdateRequestBody;
const validateTasksUpdateRequestQparam = (req, res, next) => {
    const { error } = schema_1.validateTaskUpdateParam.validate(req.query);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    next();
};
exports.validateTasksUpdateRequestQparam = validateTasksUpdateRequestQparam;
const taskTimeValidator = (req, res, next) => {
    const { expected_completion_time } = req.body;
    if (expected_completion_time) {
        const expectedTime = new Date(expected_completion_time); // Already in UTC
        const currentTime = new Date(); // Current time, local but used as UTC in .getTime()
        if (isNaN(expectedTime.getTime())) {
            return res.status(400).json({ message: "Invalid time format" });
        }
        const timeDifferenceMinutes = Math.round((expectedTime.getTime() - currentTime.getTime()) / 60000);
        if (timeDifferenceMinutes <= 0) {
            return res.status(400).json({
                message: "Time value is unacceptable. Please use a time in the future.",
            });
        }
    }
    next();
};
exports.taskTimeValidator = taskTimeValidator;
const sortTasks = async (req, res, next) => {
    try {
        const currentUser = req.user;
        const foundUser = await user_1.default
            .findOne({ userName: currentUser.username })
            .populate("tasks");
        if (!foundUser)
            return next();
        const today = new Date();
        const dayOfWeek = today.getDay(); // Sunday is 0, Monday is 1, etc.
        const weekOfMonth = (0, general_1.getWeekOfMonth)(today);
        const month = today.getMonth() + 1; // January is 0
        const year = today.getFullYear();
        const tasks = foundUser.tasks;
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        console.log("Query date range:", { start: todayStart, end: todayEnd });
        // Query for today's DailyTasks
        let DailyTasks = await dailyTasks_1.default.findOne({
            date: {
                $gte: todayStart,
                $lt: todayEnd,
            },
        });
        console.log(DailyTasks);
        if (!DailyTasks) {
            DailyTasks = await dailyTasks_1.default.create({
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
        const unCountedTasks = tasks.filter((task) => task.completed && !task.isCounted);
        const totalDuration = unCountedTasks.reduce((acc, task) => acc + (task.duration || 0), 0);
        for (const task of tasks) {
            const taskCreatedAt = new Date(task.createdAt);
            if ((0, general_1.isSameDay)(taskCreatedAt, today) &&
                task.completed &&
                !task.isCounted) {
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
        DailyTasks.amount += completedTaskCount;
        DailyTasks.minutes += dailyMinutes;
        await DailyTasks.save();
        // Weekly, Monthly, and Yearly Task Updates
        await (0, tasks_1.updateWeeklyTasks)(dayOfWeek, dailyMinutes, completedTaskCount, latestTaskDate, foundUser);
        await (0, tasks_1.updateMonthlyTasks)(weekOfMonth, foundUser, latestTaskDate);
        await (0, tasks_1.updateYearlyTasks)(month, latestTaskDate, foundUser, year);
        next();
    }
    catch (err) {
        console.error("Error in SortTasks middleware:", err);
        next(err);
    }
};
exports.sortTasks = sortTasks;
const validateUpdateUserTokenBody = (req, res, next) => {
    try {
        const { error } = schema_1.validateUserToken.validate(req.body);
        if (error)
            return res.status(400).json({ message: error.details[0].message });
        next();
    }
    catch (err) {
        console.log("Error validating user token");
        next(err);
    }
};
exports.validateUpdateUserTokenBody = validateUpdateUserTokenBody;
