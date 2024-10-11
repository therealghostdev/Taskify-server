"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const task_1 = __importDefault(require("../models/tasks/task"));
const tasks_1 = require("../utils/functions/tasks");
const date_fns_tz_1 = require("date-fns-tz");
const date_fns_1 = require("date-fns");
node_cron_1.default.schedule("* * * * *", async () => {
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
            if (user && user.fcmToken && user.timezone) {
                const userTimeZone = user.timezone;
                const userNow = (0, date_fns_tz_1.toZonedTime)(now, userTimeZone);
                const taskTriggerTime = (0, date_fns_tz_1.toZonedTime)(i.nextTrigger, userTimeZone);
                if ((0, date_fns_1.isSameMinute)(userNow, taskTriggerTime)) {
                    const taskForNotification = {
                        ...i.toObject(),
                        expected_completion_time: i.expected_completion_time.toISOString(),
                    };
                    await (0, tasks_1.createNotification)(user.fcmToken, taskForNotification);
                    const nextTrigger = new Date(taskTriggerTime);
                    if (i.recurrence === "daily") {
                        nextTrigger.setDate(nextTrigger.getDate() + 1);
                    }
                    else if (i.recurrence === "weekly") {
                        nextTrigger.setDate(nextTrigger.getDate() + 7);
                    }
                    else if (i.recurrence === "monthly") {
                        nextTrigger.setMonth(nextTrigger.getMonth() + 1);
                    }
                    i.nextTrigger = nextTrigger;
                    await i.save();
                }
            }
        }
    }
    catch (err) {
        console.error("Error running routine job", err);
    }
});
