import express, { Router } from "express";
import passport from "passport";
import { appleAuth } from "../utils/middlewares/routes/login&register";
import { loginLimiter } from "../config/rate-limiter";

export const appleAuthRouter: Router = express.Router();

// Initiate Apple Login
appleAuthRouter.get("/apple_auth", loginLimiter, (req, res, next) => {
  const { username } = req.query;
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: username as string,
  })(req, res, next);
});

// Handle Apple Callback
appleAuthRouter.post(
  "/apple/callback",
  loginLimiter,
  passport.authenticate("apple", { failureRedirect: "/" }),
  appleAuth
);
