import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import user from "../../models/user";
import { PassportStatic } from "passport";
import dotenv from "dotenv";

import {
  passportOptionTypes,
  JwtPayloadType,
  DoneFunctionType,
  userType,
} from "../../utils/types";

dotenv.config();

const options: passportOptionTypes = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.RSA_PUBLIC_KEY || "",
  algorithms: ["RS256"],
};

export default (passport: PassportStatic) => {
  // The JWT payload is passed into the verify callback
  passport.use(
    new JwtStrategy(options, function (
      jwt_payload: JwtPayloadType,
      done: DoneFunctionType
    ) {
      // Since we are here, the JWT is valid!

      // We will assign the `sub` property on the JWT to the database ID of user
      user.findOne(
        { _id: jwt_payload.sub },
        function (err: Buffer, user: userType) {
          // This flow look familiar?  It is the same as when we implemented
          // the `passport-local` strategy
          if (err) {
            return done(err, false);
          }
          if (user) {
            // Since we are here, the JWT is valid and our user is valid, so we are authorized!
            return done(null, user);
          } else {
            return done(null, false);
          }
        }
      );
    })
  );
};
