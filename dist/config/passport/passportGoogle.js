"use strict";
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
    auth_data: {
        token: "",
        expires: "",
        refreshToken: { value: "", version: 0 },
        csrf: "",
    },
});
passport.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: "/taskify/v1/auth/google/callback",
    passReqToCallback: true,
}, async function (req, accessToken, refreshToken, profile, done) {
    try {
        let foundUser;
        const username = req.query.state;
        const email = profile.emails?.[0]?.value;
        if (username && username !== "") {
            foundUser = await user_1.default.findOne({ userName: username });
        }
        else {
            foundUser = await user_1.default.findOne({
                $or: [
                    { "google_profile.id": profile.id },
                    { "google_profile.email": email },
                ],
            });
        }
        if (!foundUser) {
            const createdUser = new user_1.default({
                firstName: profile.name?.givenName || "",
                lastName: profile.name?.familyName || "",
                userName: profile.displayName || `taskify-user-${Date.now()}`,
                google_profile: [
                    {
                        id: profile.id,
                        email: profile?.emails?.[0]?.value || "",
                        displayName: profile.displayName,
                        avatar: profile.photos?.[0]?.value || "",
                    },
                ],
                salt: "taskify",
                hash: "taskify",
                createdAt: Date.now(),
            });
            await createdUser.save();
            return done(null, createUserSession(createdUser));
        }
        const updatedGoogleProfile = {
            id: profile.id,
            email: profile.emails?.[0]?.value || "",
            displayName: profile.displayName || "",
            avatar: profile.photos?.[0]?.value || "",
        };
        const googleProfileIndex = foundUser.google_profile.findIndex((p) => p.id === profile.id);
        if (googleProfileIndex === -1 ||
            foundUser.google_profile.length === 0) {
            foundUser.google_profile.push(updatedGoogleProfile);
        }
        const updatedUser = await user_1.default.findByIdAndUpdate(foundUser._id, { google_profile: foundUser.google_profile }, { new: true });
        if (!updatedUser) {
            return done(null, createUserSession(foundUser));
        }
        return done(null, createUserSession(updatedUser));
    }
    catch (err) {
        done(err);
    }
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
