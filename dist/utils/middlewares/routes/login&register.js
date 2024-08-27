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
exports.login = exports.register = void 0;
const authentication_1 = require("../../functions/authentication");
const user_1 = __importDefault(require("../../../models/user"));
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstname, lastname, username, password } = req.body;
        const hash = (0, authentication_1.genPassword)(password);
        console.log(firstname, lastname, username, hash);
        if (firstname && lastname && username && password && password !== "") {
            const newUser = new user_1.default({
                firstName: firstname,
                lastName: lastname,
                userName: username,
                hash: hash.hash,
                salt: hash.salt,
                createdAt: Date.now(),
            });
            yield newUser.save();
            return res.status(200).send("registeration successful");
        }
        return res.status(400).send("missing fields!");
    }
    catch (err) {
        console.error(err);
        if (err instanceof Error) {
            if ("code" in err && err.code === 11000) {
                return res.status(409).json({ message: "Username is already taken" });
            }
            next(err);
        }
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const found = yield user_1.default.findOne({ userName: username });
        if (!found)
            return res.status(404).json("User not found");
        const isValidUser = (0, authentication_1.validatePassword)(password, found.hash, found.salt);
        if (!isValidUser)
            return res.status(400).json("username or password invalid");
        const token = (0, authentication_1.issueJWT)(found);
        console.log(token);
        return res
            .status(200)
            .json({ success: true, token: token.token, expires: token.expires });
    }
    catch (err) {
        next(err);
    }
});
exports.login = login;
