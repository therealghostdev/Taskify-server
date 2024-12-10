import { Schema, model } from "mongoose";

const monthlyTaskSchema = new Schema({
  amount: { type: Number, required: true },
  month: { type: Number, required: true },
  date: { type: Date, required: true },
  minutes: { type: Number, required: true },
});

export default model("MonthlyTasks", monthlyTaskSchema);
