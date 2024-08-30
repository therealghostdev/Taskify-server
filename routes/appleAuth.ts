import express, { Router } from "express";
import passport from "passport";
import { appleAuth } from "../utils/middlewares/routes/login&register";

export const appleAuthRouter: Router = express.Router();

// Initiate Apple Login
appleAuthRouter.get("/apple_auth", (req, res, next) => {
  const { username } = req.query;
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: username as string,
  })(req, res, next);
});

// Handle Apple Callback
appleAuthRouter.post(
  "/apple/callback",
  passport.authenticate("apple", { failureRedirect: "/" }),
  appleAuth
);
