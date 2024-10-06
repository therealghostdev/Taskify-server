import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
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
  tasks: [{ type: Schema.Types.ObjectId, ref: "tasks" }],
  taskCount: [{ completed: { type: Number }, incomplete: { type: Number } }],
});

export default mongoose.model("User", userSchema);
