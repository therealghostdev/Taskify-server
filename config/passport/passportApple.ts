/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import AppleStrategy from "passport-apple";
import user from "../../models/user";
import { userSession } from "../../utils/types";
import dotenv from "dotenv";

dotenv.config();

const createUserSession = (user: any): userSession => ({
  _id: user._id,
  firstname: user.firstName,
  lastname: user.lastName,
  username: user.userName,
  auth_data: {
    token: "",
    expires: "",
    refreshToken: { value: "", version: 0 },
  },
});

// Apple Strategy Configuration
passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID || "",
      teamID: process.env.APPLE_TEAM_ID || "",
      keyID: process.env.APPLE_KEY_ID || "",
      privateKeyString: process.env.RSA_PRIVATE_KEY || "",
      callbackURL: "/taskify/v1/auth/apple/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, idToken, profile, done) => {
      try {
        console.log(`Apple profile: ${profile}`);

        let foundUser;
        const username = req.query.state as string;
        if (username && username !== "") {
          foundUser = await user.findOne({ userName: username });
        } else {
          foundUser = await user.findOne({
            "apple_profile.id": profile.id,
          });
        }

        // also find user by mail on this line

        
        if (!foundUser) {
          const newUser = new user({
            firstName: profile.name?.firstName || "",
            lastName: profile.name?.lastName || "",
            userName: profile.email || `apple-user-${Date.now()}`,
            appleProfile: {
              id: profile.id,
              email: profile.email,
              displayName: profile.name?.firstName || "",
            },
            salt: "taskify",
            hash: "taskify",
            createdAt: Date.now(),
          });
          await newUser.save();
          return done(null, createUserSession(newUser));
        }

        // Update Apple profile if necessary
        const updatedAppleProfile = {
          id: profile.id,
          email: profile.email,
          displayName: profile.name?.firstName || `taskify-user-${Date.now()}`,
        };

        const appleProfileIndex = foundUser.appleProfile.findIndex(
          (p) => p.id === profile.id
        );

        if (appleProfileIndex === -1 || foundUser.appleProfile.length === 0) {
          foundUser.appleProfile.push(updatedAppleProfile);
        }

        const updatedUser = await user.findByIdAndUpdate(
          foundUser._id,
          { appleProfile: foundUser.appleProfile },
          { new: true }
        );

        return done(null, createUserSession(updatedUser || foundUser));
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  const sessionUser: userSession = createUserSession(user);
  done(null, sessionUser);
});

passport.deserializeUser((user: any, done) => {
  done(null, createUserSession(user));
});
