"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const taskSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: Number, required: true },
    category: { type: String, required: true },
    duration: { type: Number, default: 0 }, // in minutes
    expected_completion_time: { type: Date, required: true },
    createdAt: { type: Date, required: true },
    completed: { type: Boolean, required: true, default: false },
    completedAt: Date,
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    isCounted: { type: Boolean, required: true, default: false },
    onFocus: { type: Boolean, default: false },
    isRoutine: { type: Boolean, default: false },
    triggerTime: { type: String },
    recurrence: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "daily",
    },
    nextTrigger: { type: Date },
});
taskSchema.methods.addTaskToUser = async function () {
    try {
        await (0, mongoose_1.model)("User").findByIdAndUpdate(this.user, {
            $push: { tasks: this._id },
        });
    }
    catch (err) {
        console.log("Something went wrong updating user:", err);
    }
};
exports.default = (0, mongoose_1.model)("Task", taskSchema);
