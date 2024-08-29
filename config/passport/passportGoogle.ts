import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import passport = require("passport");
import user from "../../models/user";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: "/taskify/v1/auth/google/callback",
      passReqToCallback: true,
    },
    async function (req, accessToken, refreshToken, profile, done) {
      try {
        let foundUser;

        const username = req.query.state as string;
        console.log(username);

        if (username && username !== "") {
          foundUser = await user.findOne({ userName: username });
        } else {
          foundUser = await user.findOne({
            "google_profile.id": profile.id,
          });
        }

        if (!foundUser) {
          const createdUser = new user({
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

          return done(null, createdUser);
        }

        const updatedGoogleProfile = {
          id: profile.id,
          email: profile.emails?.[0]?.value || "",
          displayName: profile.displayName || "",
          avatar: profile.photos?.[0]?.value || "",
        };

        const googleProfileIndex = foundUser.google_profile.findIndex(
          (p) => p.id === profile.id
        );

        if (
          googleProfileIndex === -1 ||
          foundUser.google_profile.length === 0
        ) {
          foundUser.google_profile.push(updatedGoogleProfile);
        }

        const updatedUser = await user.findByIdAndUpdate(
          foundUser._id,
          { google_profile: foundUser.google_profile },
          { new: true }
        );

        if (!updatedUser) {
          return done(null, foundUser);
        }

        return done(null, updatedUser);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user as Express.User);
});

export default passport;
