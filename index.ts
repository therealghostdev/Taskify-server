import express, { Request, Response, urlencoded, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import routes from "./routes";
import initilizePassportJwt from "./config/passport/passportJwt";
import passport from "passport";
import cors from "cors";
import "./config/passport/passportGoogle";
import session from "express-session";
import { googleAuthRouter } from "./routes/googleAuth";
import "./config/passport/passportApple";
import { appleAuthRouter } from "./routes/appleAuth";
import { startRedis, redis } from "./config/redis";
import cookieParser from "cookie-parser";
import { userRoute } from "./routes/user";
import { sanitizeInputs } from "./config/mongo-sanitize";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: path.resolve(__dirname, "..", envFile) });

const app = express();
app.use(cookieParser());

app.use(
  session({
    secret: process.env.RSA_PRIVATE_KEY || "",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60,
    },
  })
);

const port = process.env.PORT || 3000;
const dbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskify";

async function main() {
  try {
    await startRedis();
    await mongoose.connect(dbUri);
    console.log("Mongoose connection success");

    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start application:", err);
  }
}

main().catch((err) => console.error(err));

app.use(urlencoded({ extended: true }));

initilizePassportJwt(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(sanitizeInputs);

app.use(
  cors({
    origin: "*", // will be replaced with final frontend url
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many requests",
  store: new RedisStore({
    prefix: "general_",
    sendCommand: async (...args: string[]) => {
      return await redis.sendCommand(args);
    },
  }),
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message:
    "Too many login attempts, please try again after 15 minutes",
  store: new RedisStore({
    prefix: "login_",
    sendCommand: async (...args: string[]) => await redis.sendCommand(args),
  }),
});

app.use("/login", loginLimiter);
app.use("/google_auth", loginLimiter);
app.use("/apple_auth", loginLimiter);
app.use("/refresh_auth", loginLimiter);
app.use("/user", limiter);

app.use("/user", userRoute);
app.use("/taskify/v1/auth", appleAuthRouter);
app.use("/taskify/v1/auth", googleAuthRouter);
app.use("/", routes);

app.get("/", (req: Request, res: Response) => {
  res.send("Taskify server");
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});
