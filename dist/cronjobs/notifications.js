"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const task_1 = __importDefault(require("../models/tasks/task"));
const tasks_1 = require("../utils/functions/tasks");
node_cron_1.default.schedule("*****", async () => {
    try {
        const now = new Date();
        const tasks = await task_1.default
            .find({
            nextTrigger: { $lte: now },
            isRoutine: true,
        })
            .populate("user");
        for (const i of tasks) {
            const user = i.user;
            if (user && user.fcmToken) {
                const taskForNotification = {
                    ...i.toObject(),
                    expected_completion_time: i.expected_completion_time.toISOString(),
                };
                await (0, tasks_1.createNotification)(user.fcmToken, taskForNotification);
                const triggerValue = new Date(i.nextTrigger);
                if (i.recurrence === "daily")
                    triggerValue.setDate(triggerValue.getDate() + 1);
                if (i.recurrence === "weekly")
                    triggerValue.setDate(triggerValue.getDate() + 7);
                if (i.recurrence === "daily")
                    triggerValue.setDate(triggerValue.getMonth() + 1);
                i.nextTrigger = triggerValue;
                await i.save();
            }
        }
    }
    catch (err) {
        console.error("Error running routine job", err);
    }
});
