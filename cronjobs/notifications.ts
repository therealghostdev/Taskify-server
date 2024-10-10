import cron from "node-cron";
import task from "../models/tasks/task";
import { TaskType, UserDocument } from "../utils/types";
import { createNotification } from "../utils/functions/tasks";

cron.schedule("*****", async () => {
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

      if (user && user.fcmToken) {
        const taskForNotification: TaskType = {
          ...i.toObject(),
          expected_completion_time: i.expected_completion_time.toISOString(),
        };

        await createNotification(user.fcmToken, taskForNotification);

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
  } catch (err) {
    console.error("Error running routine job", err);
  }
});
