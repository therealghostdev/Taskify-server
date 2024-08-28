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
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        console.log(`GOOGLE_PROFILE: ${profile}, ACCESS_TOKEN: ${accessToken}`);

        const foundUser = await user.findOne({ googleId: profile.id });
        console.log(`DB_USER: ${foundUser}`);

        done(null, profile);
      } catch (err) {
        done(err);
      }
    }
  )
);

export default passport;
