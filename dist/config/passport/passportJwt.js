"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_jwt_1 = require("passport-jwt");
const user_1 = __importDefault(require("../../models/user"));
const dotenv_1 = __importDefault(require("dotenv"));
const authentication_1 = require("../../utils/functions/authentication");
dotenv_1.default.config();
const options = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.RSA_PUBLIC_KEY || "",
    algorithms: ["RS256"],
};
// This strategy is currently not in use
exports.default = (passport) => {
    passport.use(new passport_jwt_1.Strategy(options, function (jwt_payload, done) {
        user_1.default.findOne({ _id: jwt_payload.sub }, function (err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, (0, authentication_1.createUserSession)(user));
            }
            else {
                return done(null, false);
            }
        });
    }));
};
