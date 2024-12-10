"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    google_profile: [
        {
            id: { type: String },
            email: { type: String },
            avatar: { type: String },
            displayName: { type: String },
        },
    ],
    appleProfile: [
        {
            id: { type: String },
            email: { type: String },
            displayName: { type: String },
        },
    ],
    hash: { type: String, required: true },
    salt: { type: String, required: true },
    refreshToken: { value: String, version: Number },
    createdAt: { type: Date, required: true },
    tasks: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Task" }],
    taskCount: [
        {
            completed: { type: Number },
            incomplete: { type: Number },
            total: { type: Number },
        },
    ],
    fcmToken: { token: { type: String }, timestamp: { Date } },
    timezone: String,
});
userSchema.methods.updateTaskCounts = async function () {
    try {
        // Populate the user's tasks
        const populatedUser = await this.populate("tasks");
        const tasks = populatedUser.tasks;
        // Calculate completed and incomplete tasks
        const completedTasks = tasks.filter((task) => task.completed).length;
        const incompleteTasks = tasks.filter((task) => !task.completed).length;
        const totalTasks = tasks.length;
        // Update the task count fields
        await (0, mongoose_1.model)("User").findByIdAndUpdate(this._id, {
            $set: {
                taskCount: {
                    completed: completedTasks,
                    incomplete: incompleteTasks,
                    total: totalTasks,
                },
            },
        });
    }
    catch (err) {
        console.error("Error updating task counts on user model:", err);
    }
};
exports.default = (0, mongoose_1.model)("User", userSchema);
