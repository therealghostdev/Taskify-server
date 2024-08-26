import express, { Request, Response, urlencoded } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import routes from "./routes";
import initilizePassport from "./config/passport";
import passport from "passport";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: path.resolve(__dirname, "..", envFile) });

const app = express();
const port = process.env.PORT || 3000;
const dbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskify";

async function main() {
  try {
    await mongoose.connect(dbUri);
    console.log("Mongoose connection success");
  } catch (err) {
    console.error("Something went wrong with the database connection", err);
  }
}

main().catch((err) => console.error(err));

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.use(urlencoded({ extended: true }));

initilizePassport(passport);
app.use(passport.initialize());

app.use("/", routes);

app.get("/", (req: Request, res: Response) => {
  res.send("Taskify server");
});

app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: err.message,
  });
});
