import cron from "node-cron";
import task from "../models/tasks/task";
import { TaskType, UserDocument } from "../utils/types";
import {
  createNotification,
  createNotification1,
} from "../utils/functions/tasks";
import { toZonedTime } from "date-fns-tz";
import {
  isSameMinute,
  isAfter,
  isBefore,
  addHours,
  subMinutes,
  addMinutes,
} from "date-fns";

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const tasks = await task
      .find({
        nextTrigger: { $lte: now },
        isRoutine: true,
      })
      .populate("user");

    for (const i of tasks) {
      const user = i.user as unknown as UserDocument;

      if (user && user.fcmToken.token && user.timezone) {
        const userTimeZone = user.timezone;
        const userNow = toZonedTime(now, userTimeZone);
        const taskTriggerTime = toZonedTime(i.nextTrigger, userTimeZone);

        if (isSameMinute(userNow, taskTriggerTime)) {
          const taskForNotification: TaskType = {
            ...i.toObject(),
            expected_completion_time: i.expected_completion_time.toISOString(),
          };

          await createNotification(user.fcmToken.token, taskForNotification);

          const nextTrigger = new Date(taskTriggerTime);

          if (i.recurrence === "daily") {
            nextTrigger.setDate(nextTrigger.getDate() + 1);
          } else if (i.recurrence === "weekly") {
            nextTrigger.setDate(nextTrigger.getDate() + 7);
          } else if (i.recurrence === "monthly") {
            nextTrigger.setMonth(nextTrigger.getMonth() + 1);
          }

          i.nextTrigger = nextTrigger;
          await i.save();
        }
      }
    }
  } catch (err) {
    console.error("Error running routine job", err);
  }
});

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const oneHourFromNow = addHours(now, 1);
    const fiftyNineMinutesFromNow = subMinutes(oneHourFromNow, 1);

    const tasks = await task
      .find({
        expected_completion_time: {
          $gt: fiftyNineMinutesFromNow,
          $lte: oneHourFromNow,
        },
        completed: false,
      })
      .populate("user");

    for (const i of tasks) {
      const user = i.user as unknown as UserDocument;

      if (user && user.fcmToken && user.timezone) {
        const userTimeZone = user.timezone;
        const userNow = toZonedTime(now, userTimeZone);
        const userTaskTime = toZonedTime(
          i.expected_completion_time,
          userTimeZone
        );

        // Check if we're within the 59-60 minute window before the task
        if (
          isAfter(userTaskTime, userNow) &&
          isBefore(userTaskTime, addHours(userNow, 1)) &&
          isBefore(userTaskTime, addHours(userNow, 1.1)) &&
          i.priority > 0 &&
          i.priority <= 5 &&
          !i.onFocus
        ) {
          const taskForNotification: TaskType = {
            ...i.toObject(),
            expected_completion_time: i.expected_completion_time.toISOString(),
          };

          await createNotification1(
            user.fcmToken.token,
            taskForNotification,
            1,
            "hour"
          );
        }
      }
    }
  } catch (err) {
    console.error("Error sending notification", err);
  }
});

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const fifteenMinutesFromNow = addMinutes(now, 15);
    const fourteenMinutesFromNow = subMinutes(fifteenMinutesFromNow, 1);

    const tasks = await task
      .find({
        expected_completion_time: {
          $gt: fourteenMinutesFromNow,
          $lte: fifteenMinutesFromNow,
        },
        completed: false,
      })
      .populate("user");

    for (const i of tasks) {
      const user = i.user as unknown as UserDocument;
      if (user && user.fcmToken && user.timezone) {
        const userTimeZone = user.timezone;
        const userNow = toZonedTime(now, userTimeZone);
        const userTaskTime = toZonedTime(
          i.expected_completion_time,
          userTimeZone
        );

        // Check if we're within the 14-15 minute window before the task
        if (
          isAfter(userTaskTime, userNow) &&
          isBefore(userTaskTime, addMinutes(userNow, 15)) &&
          isBefore(userTaskTime, addMinutes(userNow, 16)) &&
          !i.onFocus &&
          i.priority > 0 &&
          i.priority <= 5
        ) {
          const taskNotification: TaskType = {
            ...i.toObject(),
            expected_completion_time: i.expected_completion_time.toISOString(),
          };

          await createNotification1(
            user.fcmToken.token,
            taskNotification,
            15,
            "minutes"
          );
        }
      }
    }
  } catch (err) {
    console.error("Error sending 15-minute notification", err);
  }
});

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const fiveMinutesFromNow = addMinutes(now, 5);
    const fourMinutesFromNow = addMinutes(now, 4);

    const tasks = await task
      .find({
        expected_completion_time: {
          $gte: fourMinutesFromNow,
          $lte: fiveMinutesFromNow,
        },
      })
      .populate("user");

    for (const i of tasks) {
      const user = i.user as unknown as UserDocument;

      if (user && user.fcmToken && user.timezone) {
        const userTimeZone = user.timezone;
        const userNow = toZonedTime(now, userTimeZone);
        const userTaskTime = toZonedTime(
          i.expected_completion_time,
          userTimeZone
        );

        if (
          isAfter(userTaskTime, userNow) &&
          isBefore(userTaskTime, addMinutes(userNow, 5)) &&
          isBefore(userTaskTime, addMinutes(userNow, 6)) &&
          !i.onFocus &&
          i.priority > 0 &&
          i.priority <= 5
        ) {
          const taskNotification: TaskType = {
            ...i.toObject(),
            expected_completion_time: i.expected_completion_time.toISOString(),
          };
          await createNotification1(
            user.fcmToken.token,
            taskNotification,
            5,
            "minutes"
          );
        }
      }
    }
  } catch (err) {
    console.error("Error sending 5-minutes notification:", err);
  }
});
