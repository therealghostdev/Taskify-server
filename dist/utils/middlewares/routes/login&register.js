"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.validateAuthentication = exports.refreshToken = exports.appleAuth = exports.googleAuth = exports.login = exports.register = void 0;
const authentication_1 = require("../../functions/authentication");
const user_1 = __importDefault(require("../../../models/user"));
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const redis_1 = require("../../../config/redis");
const csrf_csrf_1 = require("../../../config/csrf-csrf");
dotenv_1.default.config();
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstname, lastname, username, password } = req.body;
        const { salt, hash } = (0, authentication_1.genPassword)(password);
        const existingUser = yield user_1.default.findOne({ userName: username });
        if (existingUser) {
            if (existingUser.google_profile &&
                existingUser.google_profile.length > 0 &&
                existingUser.hash === "taskify" &&
                existingUser.salt === "taskify") {
                yield user_1.default.findOneAndUpdate({ userName: username }, {
                    $set: {
                        firstName: firstname,
                        lastName: lastname,
                        hash: hash,
                        salt: salt,
                    },
                }, { new: true });
                return res
                    .status(200)
                    .json({ message: "User information updated successfully" });
            }
            else {
                return res.status(409).json({ message: "Username is already taken" });
            }
        }
        else {
            const newUser = new user_1.default({
                firstName: firstname,
                lastName: lastname,
                userName: username,
                hash: hash,
                salt: salt,
                createdAt: Date.now(),
            });
            yield newUser.save();
            return res.status(201).json({ message: "User registered successfully" });
        }
    }
    catch (err) {
        console.error(err);
        if (err instanceof Error) {
            if ("code" in err && err.code === 11000) {
                return res.status(409).json({ message: "Username is already taken" });
            }
        }
        next(err);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const found = yield user_1.default.findOne({ userName: username });
        if (!found) {
            return res.status(404).json({ message: "User not found" });
        }
        const isValidUser = (0, authentication_1.validatePassword)(password, found.hash, found.salt);
        if (!isValidUser) {
            return res.status(400).json({ message: "Username or password invalid" });
        }
        let userSession = {
            _id: found._id,
            firstname: found.firstName,
            lastname: found.lastName,
            username: found.userName,
            auth_data: {
                token: "",
                expires: "",
                refreshToken: { value: "", version: 0 },
                csrf: "",
            },
        };
        const token = (0, authentication_1.issueJWT)(userSession);
        found.refreshToken = token.refreshToken;
        yield found.save();
        userSession.auth_data.token = token.token;
        userSession.auth_data.expires = token.expires;
        userSession.auth_data.refreshToken = token.refreshToken;
        userSession = (0, csrf_csrf_1.addCsrfToSession)(req, res, userSession);
        return res.status(200).json({ success: true, userSession });
    }
    catch (err) {
        next(err);
    }
});
exports.login = login;
const googleAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const G_user = req.user;
        const found = yield user_1.default.findOne({ userName: G_user === null || G_user === void 0 ? void 0 : G_user.username });
        if (!G_user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!found) {
            return res.status(404).json({ message: "User not found" });
        }
        const token = (0, authentication_1.issueJWT)(G_user);
        G_user.auth_data = token;
        found.refreshToken = token.refreshToken;
        yield found.save();
        const sessionWithCsrf = (0, csrf_csrf_1.addCsrfToSession)(req, res, G_user);
        res.status(200).json({ success: true, userSession: sessionWithCsrf });
    }
    catch (err) {
        next(err);
    }
});
exports.googleAuth = googleAuth;
const appleAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const apple_user = req.user;
        const found = yield user_1.default.findOne({ userName: apple_user });
        if (!apple_user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!found) {
            return res.status(404).json({ message: "User not found" });
        }
        const token = (0, authentication_1.issueJWT)(apple_user);
        apple_user.auth_data = token;
        found.refreshToken = token.refreshToken;
        yield found.save();
        const sessionWithCsrf = (0, csrf_csrf_1.addCsrfToSession)(req, res, apple_user);
        res.status(200).json({ success: true, userSession: sessionWithCsrf });
    }
    catch (err) {
        next(err);
    }
});
exports.appleAuth = appleAuth;
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Token not provided or empty" });
        }
        const active_user = req.user;
        if (!active_user) {
            return res.status(401).json("Unauthorized");
        }
        const currentUser = yield user_1.default.findById(active_user._id);
        const currentUserToken = (_a = currentUser === null || currentUser === void 0 ? void 0 : currentUser.refreshToken) === null || _a === void 0 ? void 0 : _a.value;
        if (!currentUser || !currentUser.refreshToken) {
            return res
                .status(401)
                .json({ message: "Invalid user or no refresh token found" });
        }
        const isblacklisted = yield redis_1.redis.get(`blacklist_${token}`);
        const isblacklisted_current_token = yield redis_1.redis.get(`blacklist_${currentUserToken}`);
        if (isblacklisted || isblacklisted_current_token)
            return res
                .status(401)
                .json({ message: "Token provided or refreshToken is invalid" });
        let verifyToken;
        try {
            verifyToken = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_PRIVATE_KEY || "");
        }
        catch (err) {
            if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
                return res.status(401).json({ message: "Invalid signature or token" });
            }
            return res.status(400).json({ message: "Could not verify token" });
        }
        if (!verifyToken) {
            return res.status(400).json({ message: "Could not verify token" });
        }
        const currentVersion = (_b = currentUser.refreshToken.version) !== null && _b !== void 0 ? _b : 0;
        if (verifyToken.version !== currentVersion) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        if (currentUserToken) {
            const expiry = Math.floor(Date.now() + 7 * 24 * 60 * 60 * 1000);
            yield (0, authentication_1.blacklistToken)(currentUserToken, expiry);
            yield (0, authentication_1.blacklistToken)(token, expiry);
            console.log("token blacklisted");
        }
        const newVersion = currentVersion + 1;
        const payload = {
            sub: currentUser.id,
            iat: Date.now() / 1000,
            version: newVersion,
        };
        const issuedToken = jsonwebtoken_1.default.sign(payload, process.env.RSA_PRIVATE_KEY || "", { expiresIn: "1d", algorithm: "RS256" });
        const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.RSA_PRIVATE_KEY || "", { algorithm: "RS256" });
        currentUser.refreshToken.value = refreshToken;
        currentUser.refreshToken.version = newVersion;
        yield currentUser.save();
        res.status(200).json({ token: issuedToken });
    }
    catch (err) {
        next(err);
    }
});
exports.refreshToken = refreshToken;
const validateAuthentication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const headerToken = (_a = req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!headerToken)
            return res.status(401).json({ message: "unauthorized" });
        const isblacklisted = yield redis_1.redis.get(`blacklist_${headerToken}`);
        if (isblacklisted)
            return res.status(401).json({ message: "Token is no longer valid" });
        let verifyToken;
        try {
            verifyToken = jsonwebtoken_1.default.verify(headerToken, process.env.REFRESH_TOKEN_PRIVATE_KEY || "");
        }
        catch (err) {
            if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
                return res.status(401).json({ message: "Invalid signature or token" });
            }
            return res.status(400).json({ message: "Could not verify token" });
        }
        if (!verifyToken)
            return res.status(403).json({ message: "Invalid Token" });
        const authenticatedUser = yield user_1.default.findById(verifyToken.sub);
        if (!authenticatedUser)
            return res.status(404).json({ message: "User not found" });
        req.user = authenticatedUser;
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.validateAuthentication = validateAuthentication;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const active_user = req.user;
        const authToken = (_a = req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (authToken) {
            const decode = jsonwebtoken_1.default.decode(authToken);
            const expiry = decode.exp
                ? decode.exp - Math.floor(Date.now() / 1000)
                : Math.floor(Date.now() + 7 * 24 * 60 * 60 * 1000);
            yield (0, authentication_1.blacklistToken)(authToken, expiry);
        }
        yield user_1.default.findByIdAndUpdate(active_user._id, {
            $unset: { refreshToken: 1 },
        });
        req.user = undefined;
        const cookieOptions = {
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            httpOnly: true,
            expires: new Date(0),
        };
        res.clearCookie("connect.sid", cookieOptions);
        res.clearCookie("__Host-psifi.x-csrf-token", cookieOptions);
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    return next(err);
                }
                res.clearCookie("connect.sid", cookieOptions);
                res.status(200).json({ message: "Logged out successfully" });
            });
        }
        else {
            res.status(200).json({ message: "Logged out successfully" });
        }
    }
    catch (err) {
        next(err);
    }
});
exports.logout = logout;
