import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT;

async function main() {
  try {
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
    await mongoose.connect("mongodb://127.0.0.1:27017/taskify");
    console.log("Mongoose connection success");
  } catch (err) {
    console.log("seomething went wrong", err);
  }
}

main().catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Taskify server");
});