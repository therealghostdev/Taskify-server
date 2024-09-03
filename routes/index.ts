import express from "express";
import {
  register,
  login,
  refreshToken,
  validateAuthentication,
  logout,
} from "../utils/middlewares/routes/login&register";
import {
  validateRegisterRequest,
  validateLoginRequest,
} from "../utils/middlewares/validators/functions";
import { csrfMiddleware } from "../config/csrf-csrf";

const router = express.Router();

// ----------------------------------------------> Authentication Routes <-------------------------------------------------------------------------
router.post("/register", validateRegisterRequest, register);

router.post("/login", validateLoginRequest, login);

router.post("/refresh_auth", validateAuthentication, refreshToken);

router.post("/logout", validateAuthentication, csrfMiddleware, logout);

// -----------------------------------------------> End of Authentication Routes <-------------------------------------------------------------------

export default router;
