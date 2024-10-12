/* eslint-disable @typescript-eslint/no-explicit-any */
import weeklyTasks from "../../models/tasks/weeklyTasks";
import monthlyTasks from "../../models/tasks/monthlyTasks";
import yearlyTasks from "../../models/tasks/yearlyTasks";
import { getWeekOfMonth } from "./general";
import { getMessaging } from "firebase-admin/messaging";
import { TaskType } from "../types";

// Update weekly tasks
export const updateWeeklyTasks = async (
  dayOfWeek: number,
  dailyMinutes: number,
  dailyTaskCount: number,
  latestTaskDate: Date,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  user: any
) => {
  const weekOfMonth = getWeekOfMonth(new Date());
  let WeeklyTask = await weeklyTasks.findOne({ week: weekOfMonth });
  if (!WeeklyTask) {
    WeeklyTask = await weeklyTasks.create({
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

// Update monthly tasks
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateMonthlyTasks = async (
  weekOfMonth: number,
  user: any,
  latestTaskDate: Date
) => {
  const month = new Date().getMonth() + 1;
  let MonthlyTask = await monthlyTasks.findOne({ month });
  if (!MonthlyTask) {
    MonthlyTask = await monthlyTasks.create({
      month,
      amount: 0,
      minutes: 0,
      date: latestTaskDate,
    });
  }

  // Aggregate data from weekly tasks
  const WeeklyTasks = await weeklyTasks.find({ week: { $lte: weekOfMonth } });
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

// Update yearly tasks
export const updateYearlyTasks = async (
  month: number,
  latestTaskDate: Date,
  user: any,
  year: number
) => {
  let YearlyTask = await yearlyTasks.findOne({ year });
  if (!YearlyTask) {
    YearlyTask = await yearlyTasks.create({
      year,
      amount: 0,
      minutes: 0,
      date: latestTaskDate,
    });
  }

  // Aggregate data from monthly tasks
  const MonthlyTasks = await monthlyTasks.find({ month: { $lte: month } });
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

export const createNotification = async (token: string, tasks: TaskType) => {
  const message = {
    token,
    notification: {
      title: `Reminder for ${tasks.name} in your schedule`,
      body: `it's time to ${tasks.name}`,
    },
  };

  try {
    await getMessaging().send(message);
  } catch (err) {
    console.error("Error sending notification:", err);
  }
};

export const createNotification1 = async (
  token: string,
  tasks: TaskType,
  duration: number,
  unit: string
) => {
  const message = {
    token,
    notification: {
      title: `Reminder for ${tasks.name} in your schedule`,
      body: `${tasks.name} is expected to be done in ${duration}${unit} are you on track to complete it?`,
    },
  };

  try {
    await getMessaging().send(message);
  } catch (err) {
    console.error("Error sending notification1:", err);
  }
};
