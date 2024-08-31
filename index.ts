import express, { Request, Response, urlencoded } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import routes from "./routes";
import initilizePassportJwt from "./config/passport/passportJwt";
import passport from "passport";
import ErrorMessage from "./lib/ErrorMessage";
import cors from "cors";
import "./config/passport/passportGoogle";
import session from "express-session";
import { googleAuthRouter } from "./routes/googleAuth";
import "./config/passport/passportApple";
import { appleAuthRouter } from "./routes/appleAuth";
import { startRedis } from "./config/redis/client";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: path.resolve(__dirname, "..", envFile) });

const app = express();

app.use(
  session({
    secret: process.env.RSA_PRIVATE_KEY || "",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, maxAge: 1000 * 60 * 60 },
  })
);

app.use(
  cors({
    origin: "*", // will be replaced with final frontend url
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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

startRedis().catch((err) => console.log(err));

app.use(urlencoded({ extended: true }));

initilizePassportJwt(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use("/taskify/v1/auth", appleAuthRouter);
app.use("/taskify/v1/auth", googleAuthRouter);
app.use("/", routes);

app.get("/", (req: Request, res: Response) => {
  res.send("Taskify server");
});

app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  if (err instanceof ErrorMessage) {
    return res.status(err.code).json({ message: err.message });
  }
  return res.status(500).json({ message: "Something went wrong!" });
});
