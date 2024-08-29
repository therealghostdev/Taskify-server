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
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
const passport = require("passport");
const user_1 = __importDefault(require("../../models/user"));
dotenv_1.default.config();
const createUserSession = (user) => ({
    _id: user._id,
    firstname: user.firstName,
    lastname: user.lastName,
    username: user.userName,
    cssrfToken: { token: "", expires: "" },
});
passport.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: "/taskify/v1/auth/google/callback",
    passReqToCallback: true,
}, function (req, accessToken, refreshToken, profile, done) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        try {
            let foundUser;
            const username = req.query.state;
            console.log(username);
            if (username && username !== "") {
                foundUser = yield user_1.default.findOne({ userName: username });
            }
            else {
                foundUser = yield user_1.default.findOne({
                    "google_profile.id": profile.id,
                });
            }
            if (!foundUser) {
                const createdUser = new user_1.default({
                    firstName: ((_a = profile.name) === null || _a === void 0 ? void 0 : _a.givenName) || "",
                    lastName: ((_b = profile.name) === null || _b === void 0 ? void 0 : _b.familyName) || "",
                    userName: profile.displayName || `taskify-user-${Date.now()}`,
                    google_profile: [
                        {
                            id: profile.id,
                            email: ((_d = (_c = profile === null || profile === void 0 ? void 0 : profile.emails) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value) || "",
                            displayName: profile.displayName,
                            avatar: ((_f = (_e = profile.photos) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.value) || "",
                        },
                    ],
                    salt: "taskify",
                    hash: "taskify",
                    createdAt: Date.now(),
                });
                yield createdUser.save();
                return done(null, createUserSession(createdUser));
            }
            const updatedGoogleProfile = {
                id: profile.id,
                email: ((_h = (_g = profile.emails) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.value) || "",
                displayName: profile.displayName || "",
                avatar: ((_k = (_j = profile.photos) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.value) || "",
            };
            const googleProfileIndex = foundUser.google_profile.findIndex((p) => p.id === profile.id);
            if (googleProfileIndex === -1 ||
                foundUser.google_profile.length === 0) {
                foundUser.google_profile.push(updatedGoogleProfile);
            }
            const updatedUser = yield user_1.default.findByIdAndUpdate(foundUser._id, { google_profile: foundUser.google_profile }, { new: true });
            if (!updatedUser) {
                return done(null, createUserSession(foundUser));
            }
            return done(null, createUserSession(updatedUser));
        }
        catch (err) {
            done(err);
        }
    });
}));
passport.serializeUser((user, done) => {
    // Only store the necessary user session data
    const sessionUser = createUserSession(user);
    done(null, sessionUser);
});
passport.deserializeUser((user, done) => {
    // Pass only the necessary data to req.user
    done(null, createUserSession(user));
});
exports.default = passport;
