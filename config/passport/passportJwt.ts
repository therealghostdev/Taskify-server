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
  passport.use(
    new JwtStrategy(options, function (
      jwt_payload: JwtPayloadType,
      done: DoneFunctionType
    ) {
      user.findOne(
        { _id: jwt_payload.sub },
        function (err: Buffer, user: userType) {
          if (err) {
            return done(err, false);
          }
          if (user) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        }
      );
    })
  );
};
