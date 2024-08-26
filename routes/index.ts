import express from "express";
import { register, login } from "../utils/middlewares/routes/login&register";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

export default router;
