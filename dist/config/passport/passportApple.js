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
/* eslint-disable @typescript-eslint/no-explicit-any */
const passport_1 = __importDefault(require("passport"));
const passport_apple_1 = __importDefault(require("passport-apple"));
const user_1 = __importDefault(require("../../models/user"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const createUserSession = (user) => ({
    _id: user._id,
    firstname: user.firstName,
    lastname: user.lastName,
    username: user.userName,
    auth_data: { token: "", expires: "", refreshToken: "" },
});
// Apple Strategy Configuration
passport_1.default.use(new passport_apple_1.default({
    clientID: process.env.APPLE_CLIENT_ID || "",
    teamID: process.env.APPLE_TEAM_ID || "",
    keyID: process.env.APPLE_KEY_ID || "",
    privateKeyString: process.env.RSA_PRIVATE_KEY || "",
    callbackURL: "/taskify/v1/auth/apple/callback",
    passReqToCallback: true,
}, (req, accessToken, refreshToken, idToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        console.log(`Apple profile: ${profile}`);
        let foundUser;
        const username = req.query.state;
        if (username && username !== "") {
            foundUser = yield user_1.default.findOne({ userName: username });
        }
        else {
            foundUser = yield user_1.default.findOne({
                "apple_profile.id": profile.id,
            });
        }
        if (!foundUser) {
            const newUser = new user_1.default({
                firstName: ((_a = profile.name) === null || _a === void 0 ? void 0 : _a.firstName) || "",
                lastName: ((_b = profile.name) === null || _b === void 0 ? void 0 : _b.lastName) || "",
                userName: profile.email || `apple-user-${Date.now()}`,
                appleProfile: {
                    id: profile.id,
                    email: profile.email,
                    displayName: ((_c = profile.name) === null || _c === void 0 ? void 0 : _c.firstName) || "",
                },
                salt: "taskify",
                hash: "taskify",
                createdAt: Date.now(),
            });
            yield newUser.save();
            return done(null, createUserSession(newUser));
        }
        // Update Apple profile if necessary
        const updatedAppleProfile = {
            id: profile.id,
            email: profile.email,
            displayName: ((_d = profile.name) === null || _d === void 0 ? void 0 : _d.firstName) || `taskify-user-${Date.now()}`,
        };
        const appleProfileIndex = foundUser.appleProfile.findIndex((p) => p.id === profile.id);
        if (appleProfileIndex === -1 || foundUser.appleProfile.length === 0) {
            foundUser.appleProfile.push(updatedAppleProfile);
        }
        const updatedUser = yield user_1.default.findByIdAndUpdate(foundUser._id, { appleProfile: foundUser.appleProfile }, { new: true });
        return done(null, createUserSession(updatedUser || foundUser));
    }
    catch (err) {
        done(err);
    }
})));
passport_1.default.serializeUser((user, done) => {
    const sessionUser = createUserSession(user);
    done(null, sessionUser);
});
passport_1.default.deserializeUser((user, done) => {
    done(null, createUserSession(user));
});
