"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const dailyTaskSchema = new mongoose_1.Schema({
    amount: { type: Number, required: true },
    day: { type: Number, required: true },
    date: { type: Date, required: true },
    minutes: { type: Number, required: true },
});
exports.default = (0, mongoose_1.model)("DailyTasks", dailyTaskSchema);
