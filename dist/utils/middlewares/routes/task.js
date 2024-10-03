"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTask = exports.addTask = void 0;
const task_1 = __importDefault(require("../../../models/tasks/task"));
const user_1 = __importDefault(require("../../../models/user"));
const authentication_1 = require("../../functions/authentication");
const addTask = async (req, res, next) => {
    try {
        const { name, description, priority, category, expected_completion_time } = req.body;
        const formatted_expected_completion_time = new Date(expected_completion_time).toISOString();
        const currentUser = req.user;
        const foundUser = await user_1.default.findOne({ userName: currentUser?.username });
        console.log("req,user", req.user);
        console.log("Logged in user", currentUser);
        console.log("Found user:", foundUser);
        if (!foundUser)
            return res.status(404).json({ message: "User not found" });
        const newTask = new task_1.default({
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
            createdAt: {
                $gte: new Date(selectedDate.setUTCHours(0, 0, 0, 0)),
                $lt: new Date(selectedDate.setUTCHours(23, 59, 59, 999)),
            },
            completed,
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
