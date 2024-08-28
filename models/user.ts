import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  googleId: { type: String, unique: true },
  gmail: { type: String, unique: true },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

export default mongoose.model("User", userSchema);
