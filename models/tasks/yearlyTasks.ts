import { Schema, model } from "mongoose";

const yearlyTaskSchema = new Schema({
  amount: { type: Number, required: true },
  year: { type: Number, required: true },
  date: { type: Date, required: true },
  minutes: { type: Number, required: true },
});

export default model("YearlyTasks", yearlyTaskSchema);
