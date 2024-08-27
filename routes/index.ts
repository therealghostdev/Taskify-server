import express from "express";
import { register, login } from "../utils/middlewares/routes/login&register";
import {
  validateRegisterRequest,
  validateLoginRequest,
} from "../utils/middlewares/validators/functions";

const router = express.Router();

router.post("/register", validateRegisterRequest, register);

router.post("/login", validateLoginRequest, login);

export default router;
