"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// user can't delete a routine task
const taskSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: Number, required: true },
    category: { type: String, required: true },
    duration: Number,
    expected_completion_time: { type: Date, required: true },
    createdAt: { type: Date, required: true },
    completed: { type: Boolean, required: true, default: false },
    completedAt: Date,
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "users", required: true },
    isRoutine: { type: Boolean, default: false },
    triggerTime: { type: String },
    recurrence: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "daily",
    },
    nextTrigger: { type: Date },
});
exports.default = (0, mongoose_1.model)("Task", taskSchema);
