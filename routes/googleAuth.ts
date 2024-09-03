import passport from "passport";
import express, { Router } from "express";
import { googleAuth } from "../utils/middlewares/routes/login&register";
import { loginLimiter } from "../config/rate-limiter";

export const googleAuthRouter: Router = express.Router();
// initilize google authentication
googleAuthRouter.get("/google_auth", loginLimiter, (req, res, next) => {
  const { username } = req.query;
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: username as string,
  })(req, res, next);
});

googleAuthRouter.get(
  "/google/callback",
  loginLimiter,
  passport.authenticate("google", { failureRedirect: "/" }),
  googleAuth
);
