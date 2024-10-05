import { Schema, model, ObjectId } from "mongoose";
import { RecurrenceType } from "../../utils/types";

interface TaskDocument extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  priority: number;
  category: string;
  expected_completion_time: Date;
  createdAt: Date;
  completed: boolean;
  duration: number;
  completedAt: Date;
  user: ObjectId;
  isRoutine: boolean;
  triggerTime: string;
  recurrence: RecurrenceType;
  nextTrigger: Date;
  addTaskToUser(): Promise<void>;
}

const taskSchema = new Schema<TaskDocument>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: Number, required: true },
  category: { type: String, required: true },
  duration: Number,
  expected_completion_time: { type: Date, required: true },
  createdAt: { type: Date, required: true },
  completed: { type: Boolean, required: true, default: false },
  completedAt: Date,
  user: { type: Schema.Types.ObjectId, ref: "users", required: true },

  isRoutine: { type: Boolean, default: false },
  triggerTime: { type: String },
  recurrence: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
    default: "daily",
  },
  nextTrigger: { type: Date },
});

taskSchema.methods.addTaskToUser = async function () {
  try {
    const task = this as TaskDocument;
    await model("User").findByIdAndUpdate(task.user, {
      $push: { tasks: task._id },
    });
  } catch (err) {
    console.log("Something went wrong updating user:", err);
  }
};

export default model("Task", taskSchema);
