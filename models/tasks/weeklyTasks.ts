import { Schema, model } from "mongoose";

const weeklyTaskSchema = new Schema({
  amount: { type: Number, required: true },
  week: { type: Number, required: true },
  date: { type: Date, required: true },
  minutes: { type: Number, required: true },
});

export default model("WeeklyTasks", weeklyTaskSchema);
