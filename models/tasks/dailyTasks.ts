import { Schema, model } from "mongoose";

const dailyTaskSchema = new Schema({
  amount: { type: Number, required: true },
  day: { type: Number, required: true },
  date: { type: Date, required: true },
  minutes: { type: Number, required: true },
});

export default model("DailyTasks", dailyTaskSchema);
