import { Schema, model } from "mongoose";

// user can't delete a routine task
const taskSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, required: true },
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

export default model("Task", taskSchema);
