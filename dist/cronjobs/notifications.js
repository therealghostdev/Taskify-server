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
node_cron_1.default.schedule("* * * * *", async () => {
    try {
        const now = new Date();
        const oneHourFromNow = (0, date_fns_1.addHours)(now, 1);
        const fiftyNineMinutesFromNow = (0, date_fns_1.subMinutes)(oneHourFromNow, 1);
        const tasks = await task_1.default
            .find({
            expected_completion_time: {
                $gt: fiftyNineMinutesFromNow,
                $lte: oneHourFromNow,
            },
            completed: false,
        })
            .populate("user");
        for (const i of tasks) {
            const user = i.user;
            if (user && user.fcmToken && user.timezone) {
                const userTimeZone = user.timezone;
                const userNow = (0, date_fns_tz_1.toZonedTime)(now, userTimeZone);
                const userTaskTime = (0, date_fns_tz_1.toZonedTime)(i.expected_completion_time, userTimeZone);
                // Check if we're within the 59-60 minute window before the task
                if ((0, date_fns_1.isAfter)(userTaskTime, userNow) &&
                    (0, date_fns_1.isBefore)(userTaskTime, (0, date_fns_1.addHours)(userNow, 1)) &&
                    (0, date_fns_1.isBefore)(userTaskTime, (0, date_fns_1.addHours)(userNow, 1.1)) &&
                    i.priority > 0 &&
                    i.priority <= 5 &&
                    !i.onFocus) {
                    const taskForNotification = {
                        ...i.toObject(),
                        expected_completion_time: i.expected_completion_time.toISOString(),
                    };
                    await (0, tasks_1.createNotification1)(user.fcmToken, taskForNotification, 1, "hour");
                }
            }
        }
    }
    catch (err) {
        console.error("Error sending notification", err);
    }
});
node_cron_1.default.schedule("* * * * *", async () => {
    try {
        const now = new Date();
        const fifteenMinutesFromNow = (0, date_fns_1.addMinutes)(now, 15);
        const fourteenMinutesFromNow = (0, date_fns_1.subMinutes)(fifteenMinutesFromNow, 1);
        const tasks = await task_1.default
            .find({
            expected_completion_time: {
                $gt: fourteenMinutesFromNow,
                $lte: fifteenMinutesFromNow,
            },
            completed: false,
        })
            .populate("user");
        for (const i of tasks) {
            const user = i.user;
            if (user && user.fcmToken && user.timezone) {
                const userTimeZone = user.timezone;
                const userNow = (0, date_fns_tz_1.toZonedTime)(now, userTimeZone);
                const userTaskTime = (0, date_fns_tz_1.toZonedTime)(i.expected_completion_time, userTimeZone);
                // Check if we're within the 14-15 minute window before the task
                if ((0, date_fns_1.isAfter)(userTaskTime, userNow) &&
                    (0, date_fns_1.isBefore)(userTaskTime, (0, date_fns_1.addMinutes)(userNow, 15)) &&
                    (0, date_fns_1.isBefore)(userTaskTime, (0, date_fns_1.addMinutes)(userNow, 16)) &&
                    !i.onFocus &&
                    i.priority > 0 &&
                    i.priority <= 5) {
                    const taskNotification = {
                        ...i.toObject(),
                        expected_completion_time: i.expected_completion_time.toISOString(),
                    };
                    await (0, tasks_1.createNotification1)(user.fcmToken, taskNotification, 15, "minutes");
                }
            }
        }
    }
    catch (err) {
        console.error("Error sending 15-minute notification", err);
    }
});
node_cron_1.default.schedule("* * * * *", async () => {
    try {
        const now = new Date();
        const fiveMinutesFromNow = (0, date_fns_1.addMinutes)(now, 5);
        const fourMinutesFromNow = (0, date_fns_1.addMinutes)(now, 4);
        const tasks = await task_1.default
            .find({
            expected_completion_time: {
                $gte: fourMinutesFromNow,
                $lte: fiveMinutesFromNow,
            },
        })
            .populate("user");
        for (const i of tasks) {
            const user = i.user;
            if (user && user.fcmToken && user.timezone) {
                const userTimeZone = user.timezone;
                const userNow = (0, date_fns_tz_1.toZonedTime)(now, userTimeZone);
                const userTaskTime = (0, date_fns_tz_1.toZonedTime)(i.expected_completion_time, userTimeZone);
                if ((0, date_fns_1.isAfter)(userTaskTime, userNow) &&
                    (0, date_fns_1.isBefore)(userTaskTime, (0, date_fns_1.addMinutes)(userNow, 5)) &&
                    (0, date_fns_1.isBefore)(userTaskTime, (0, date_fns_1.addMinutes)(userNow, 6)) &&
                    !i.onFocus &&
                    i.priority > 0 &&
                    i.priority <= 5) {
                    const taskNotification = {
                        ...i.toObject(),
                        expected_completion_time: i.expected_completion_time.toISOString(),
                    };
                    await (0, tasks_1.createNotification1)(user.fcmToken, taskNotification, 5, "minutes");
                }
            }
        }
    }
    catch (err) {
        console.error("Error sending 5-minutes notification:", err);
    }
});
