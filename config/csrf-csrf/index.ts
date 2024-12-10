import { NextFunction, Request, Response } from "express";
import { doubleCsrf } from "csrf-csrf";
import { userSession } from "../../utils/types";
import dotenv from "dotenv";

dotenv.config();

const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => process.env.RSA_PRIVATE_KEY || "",
  cookieName:
    process.env.NODE_ENV === "production"
      ? "__Host-psifi.x-csrf-token"
      : "psifi.x-csrf-token",
  cookieOptions: {
    path: "/", // Required for __Host- prefix
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  },
  getTokenFromRequest: (req) => req.headers["x-csrf-token"] as string,
});

const handleCsrfError = (err: Buffer, req: Request, res: Response) => {
  res.status(403).json({ error: "CSRF token validation failed" });
};

const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const headerToken = req.headers["x-csrf-token"] as string;
  const cookieToken =
    process.env.NODE_ENV === "production"
      ? req.cookies["__Host-psifi.x-csrf-token"]?.split("|")[0]
      : req.cookies["psifi.x-csrf-token"]?.split("|")[0];

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    console.error("CSRF token mismatch");
    console.log(headerToken, cookieToken);

    return res.status(403).json({ error: "CSRF token mismatch or missing" });
  }

  doubleCsrfProtection(req, res, (err) => {
    if (err) {
      handleCsrfError(err, req, res);
      console.log("csrf error", err);
      next(err);
    }
    next();
  });
};

const addCsrfToSession = (
  req: Request,
  res: Response,
  session: userSession
): userSession => {
  const csrfToken = generateToken(req, res, false);
  return {
    ...session,
    auth_data: {
      ...session.auth_data,
      csrf: csrfToken,
    },
  };
};

export { generateToken, addCsrfToSession, handleCsrfError, csrfMiddleware };
