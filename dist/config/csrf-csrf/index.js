"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.csrfMiddleware = exports.handleCsrfError = exports.addCsrfToSession = exports.generateToken = void 0;
const csrf_csrf_1 = require("csrf-csrf");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { doubleCsrfProtection, generateToken } = (0, csrf_csrf_1.doubleCsrf)({
    getSecret: () => process.env.RSA_PRIVATE_KEY || "",
    cookieName: process.env.NODE_ENV === "production"
        ? "__Host-psifi.x-csrf-token"
        : "psifi.x-csrf-token",
    cookieOptions: {
        path: "/", // Required for __Host- prefix
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    },
    getTokenFromRequest: (req) => req.headers["x-csrf-token"],
});
exports.generateToken = generateToken;
const handleCsrfError = (err, req, res) => {
    res.status(403).json({ error: "CSRF token validation failed" });
};
exports.handleCsrfError = handleCsrfError;
const csrfMiddleware = (req, res, next) => {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    const headerToken = req.headers["x-csrf-token"];
    const cookieToken = process.env.NODE_ENV === "production"
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
exports.csrfMiddleware = csrfMiddleware;
const addCsrfToSession = (req, res, session) => {
    const csrfToken = generateToken(req, res, false);
    return {
        ...session,
        auth_data: {
            ...session.auth_data,
            csrf: csrfToken,
        },
    };
};
exports.addCsrfToSession = addCsrfToSession;
