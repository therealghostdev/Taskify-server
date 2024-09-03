import passport from "passport";
import express, { Router } from "express";
import { googleAuth } from "../utils/middlewares/routes/login&register";
import { limiter } from "../config/rate-limiter";

export const googleAuthRouter: Router = express.Router();
// initilize google authentication
googleAuthRouter.get("/google_auth", limiter, (req, res, next) => {
  const { username } = req.query;
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: username as string,
  })(req, res, next);
});

googleAuthRouter.get(
  "/google/callback",
  limiter,
  passport.authenticate("google", { failureRedirect: "/" }),
  googleAuth
);
