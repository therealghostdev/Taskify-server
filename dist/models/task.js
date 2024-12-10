"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const taskSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, required: true },
    category: { type: String, required: true },
    duration: { type: Number, required: true },
    createdAt: { type: Date, required: true },
    expected_completion_time: { type: Date, required: true },
    completedAt: Date,
    completed: { type: Boolean, required: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "users", required: true },
});
exports.default = (0, mongoose_1.model)("Task", taskSchema);
