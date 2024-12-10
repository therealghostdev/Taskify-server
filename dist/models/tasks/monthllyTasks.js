"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const monthlyTaskSchema = new mongoose_1.Schema({
    amount: { type: Number, required: true },
    month: { type: Number, required: true },
    date: { type: Date, required: true },
    minutes: { type: Number, required: true },
});
exports.default = (0, mongoose_1.model)("MonthlyTasks", monthlyTaskSchema);
