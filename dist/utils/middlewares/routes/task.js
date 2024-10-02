"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTask = void 0;
const task_1 = __importDefault(require("../../../models/tasks/task"));
const user_1 = __importDefault(require("../../../models/user"));
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
