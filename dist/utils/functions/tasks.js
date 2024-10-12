"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification1 = exports.createNotification = exports.updateYearlyTasks = exports.updateMonthlyTasks = exports.updateWeeklyTasks = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const weeklyTasks_1 = __importDefault(require("../../models/tasks/weeklyTasks"));
const monthlyTasks_1 = __importDefault(require("../../models/tasks/monthlyTasks"));
const yearlyTasks_1 = __importDefault(require("../../models/tasks/yearlyTasks"));
const general_1 = require("./general");
const messaging_1 = require("firebase-admin/messaging");
// Update weekly tasks
const updateWeeklyTasks = async (dayOfWeek, dailyMinutes, dailyTaskCount, latestTaskDate, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
user) => {
    const weekOfMonth = (0, general_1.getWeekOfMonth)(new Date());
    let WeeklyTask = await weeklyTasks_1.default.findOne({ week: weekOfMonth });
    if (!WeeklyTask) {
        WeeklyTask = await weeklyTasks_1.default.create({
            week: weekOfMonth,
            amount: 0,
            minutes: 0,
            date: latestTaskDate,
        });
    }
    WeeklyTask.amount += dailyTaskCount;
    WeeklyTask.minutes += dailyMinutes;
    if (latestTaskDate > WeeklyTask.date) {
        WeeklyTask.date = latestTaskDate;
    }
    await WeeklyTask.save();
};
exports.updateWeeklyTasks = updateWeeklyTasks;
// Update monthly tasks
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateMonthlyTasks = async (weekOfMonth, user, latestTaskDate) => {
    const month = new Date().getMonth() + 1;
    let MonthlyTask = await monthlyTasks_1.default.findOne({ month });
    if (!MonthlyTask) {
        MonthlyTask = await monthlyTasks_1.default.create({
            month,
            amount: 0,
            minutes: 0,
            date: latestTaskDate,
        });
    }
    // Aggregate data from weekly tasks
    const WeeklyTasks = await weeklyTasks_1.default.find({ week: { $lte: weekOfMonth } });
    let monthlyMinutes = 0;
    let monthlyAmount = 0;
    WeeklyTasks.forEach((task) => {
        monthlyMinutes += task.minutes;
        monthlyAmount += task.amount;
    });
    MonthlyTask.amount = monthlyAmount;
    MonthlyTask.minutes = monthlyMinutes;
    if (latestTaskDate > MonthlyTask.date) {
        MonthlyTask.date = latestTaskDate;
    }
    await MonthlyTask.save();
};
exports.updateMonthlyTasks = updateMonthlyTasks;
// Update yearly tasks
const updateYearlyTasks = async (month, latestTaskDate, user, year) => {
    let YearlyTask = await yearlyTasks_1.default.findOne({ year });
    if (!YearlyTask) {
        YearlyTask = await yearlyTasks_1.default.create({
            year,
            amount: 0,
            minutes: 0,
            date: latestTaskDate,
        });
    }
    // Aggregate data from monthly tasks
    const MonthlyTasks = await monthlyTasks_1.default.find({ month: { $lte: month } });
    let yearlyMinutes = 0;
    let yearlyAmount = 0;
    MonthlyTasks.forEach((task) => {
        yearlyMinutes += task.minutes;
        yearlyAmount += task.amount;
    });
    YearlyTask.amount = yearlyAmount;
    YearlyTask.minutes = yearlyMinutes;
    if (latestTaskDate > YearlyTask.date) {
        YearlyTask.date = latestTaskDate;
    }
    await YearlyTask.save();
};
exports.updateYearlyTasks = updateYearlyTasks;
const createNotification = async (token, tasks) => {
    const message = {
        token,
        notification: {
            title: `Reminder for ${tasks.name} in your schedule`,
            body: `it's time to ${tasks.name}`,
        },
    };
    try {
        await (0, messaging_1.getMessaging)().send(message);
    }
    catch (err) {
        console.error("Error sending notification:", err);
    }
};
exports.createNotification = createNotification;
const createNotification1 = async (token, tasks, duration, unit) => {
    const message = {
        token,
        notification: {
            title: `Reminder for ${tasks.name} in your schedule`,
            body: `${tasks.name} is expected to be done in ${duration}${unit} are you on track to complete it?`,
        },
    };
    try {
        await (0, messaging_1.getMessaging)().send(message);
    }
    catch (err) {
        console.error("Error sending notification1:", err);
    }
};
exports.createNotification1 = createNotification1;
