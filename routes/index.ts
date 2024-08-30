import express from "express";
import {
  register,
  login,
  refreshToken,
} from "../utils/middlewares/routes/login&register";
import {
  validateRegisterRequest,
  validateLoginRequest,
} from "../utils/middlewares/validators/functions";

const router = express.Router();

// ----------------------------------------------> Authentication Routes <-------------------------------------------------------------------------
router.post("/register", validateRegisterRequest, register);

router.post("/login", validateLoginRequest, login);

router.post("/refresh_auth", refreshToken);

// -----------------------------------------------> End of Authentication Routes <-------------------------------------------------------------------

export default router;
