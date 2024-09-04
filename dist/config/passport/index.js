"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_jwt_1 = require("passport-jwt");
const user_1 = __importDefault(require("../../models/user"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const options = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.RSA_PUBLIC_KEY || "",
    algorithms: ["RS256"],
};
exports.default = (passport) => {
    // The JWT payload is passed into the verify callback
    passport.use(new passport_jwt_1.Strategy(options, function (jwt_payload, done) {
        // Since we are here, the JWT is valid!
        // We will assign the `sub` property on the JWT to the database ID of user
        user_1.default.findOne({ _id: jwt_payload.sub }, function (err, user) {
            // This flow look familiar?  It is the same as when we implemented
            // the `passport-local` strategy
            if (err) {
                return done(err, false);
            }
            if (user) {
                // Since we are here, the JWT is valid and our user is valid, so we are authorized!
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));
};
