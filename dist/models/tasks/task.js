"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// user can't delete a routine task
const taskSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, required: true },
    category: { type: String, required: true },
    duration: { type: Number, required: true },
    createdAt: { type: Date, required: true },
    expected_completion_time: { type: Date, required: true },
    completedAt: Date,
    completed: { type: Boolean, required: true, default: false },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "users", required: true },
    // Routine-related fields
    isRoutine: { type: Boolean, default: false }, // Flag for routine
    triggerTime: { type: String }, // Time when the user should be notified (e.g., "09:00")
    recurrence: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "daily",
    }, // Recurrence pattern
    nextTrigger: { type: Date }, // The next time the task should be automatically created
});
exports.default = (0, mongoose_1.model)("Task", taskSchema);
