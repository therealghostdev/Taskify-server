"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserToken = void 0;
const user_1 = __importDefault(require("../../../models/user"));
const updateUserToken = async (req, res, next) => {
    try {
        const { fcmToken } = req.body;
        const currentUser = req.user;
        const foundUser = await user_1.default.findOne({ userName: currentUser.username });
        if (!foundUser)
            return res.status(404).json({ message: "User not found" });
        const token = { token: fcmToken, timestamp: Date.now() };
        await user_1.default.updateOne({ _id: foundUser._id }, { fcmToken: token });
        res.status(200).json({ message: "Token updated" });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
};
exports.updateUserToken = updateUserToken;
