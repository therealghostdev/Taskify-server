import cron from "node-cron";
import task from "../models/tasks/task";
import { TaskType, UserDocument } from "../utils/types";
import { createNotification } from "../utils/functions/tasks";
import { toZonedTime } from "date-fns-tz";
import { isSameMinute } from "date-fns";

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

      if (user && user.fcmToken && user.timezone) {
        const userTimeZone = user.timezone;
        const userNow = toZonedTime(now, userTimeZone);
        const taskTriggerTime = toZonedTime(i.nextTrigger, userTimeZone);

        if (isSameMinute(userNow, taskTriggerTime)) {
          const taskForNotification: TaskType = {
            ...i.toObject(),
            expected_completion_time: i.expected_completion_time.toISOString(),
          };

          await createNotification(user.fcmToken, taskForNotification);

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
