import express from "express";
import {
  register,
  login,
  googleAuth,
} from "../utils/middlewares/routes/login&register";
import {
  validateRegisterRequest,
  validateLoginRequest,
} from "../utils/middlewares/validators/functions";
import passport from "passport";

const router = express.Router();

// ----------------------------------------------> Authentication Routes <-------------------------------------------------------------------------
router.post("/register", validateRegisterRequest, register);

router.post("/login", validateLoginRequest, login);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleAuth
);

// -----------------------------------------------> End of Authentication Routes <-------------------------------------------------------------------

export default router;
