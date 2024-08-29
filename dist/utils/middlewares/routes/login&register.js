"use strict";
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
exports.googleAuth = exports.login = exports.register = void 0;
const authentication_1 = require("../../functions/authentication");
const user_1 = __importDefault(require("../../../models/user"));
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
        if (!found)
            return res.status(404).json("User not found");
        const isValidUser = (0, authentication_1.validatePassword)(password, found.hash, found.salt);
        if (!isValidUser)
            return res.status(400).json("username or password invalid");
        const userSession = {
            _id: found._id,
            firstname: found.firstName,
            lastname: found.lastName,
            username: found.userName,
            cssrfToken: { token: "", expires: "" },
        };
        const token = (0, authentication_1.issueJWT)(userSession);
        userSession.cssrfToken.token = token.token;
        userSession.cssrfToken.expires = token.expires;
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
        if (!G_user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.log(req.user);
        const token = (0, authentication_1.issueJWT)(G_user);
        G_user.cssrfToken = token;
        // G_user.cssrfToken.token = token.expires;
        console.log(token);
        res.status(200).json({ success: true, userSession: G_user });
    }
    catch (err) {
        next(err);
    }
});
exports.googleAuth = googleAuth;
