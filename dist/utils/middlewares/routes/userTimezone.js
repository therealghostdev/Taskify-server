"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserTimezone = void 0;
const user_1 = __importDefault(require("../../../models/user"));
const updateUserTimezone = async (req, res, next) => {
    try {
        const { timezone } = req.body;
        const activeUser = req.user;
        const currentUser = await user_1.default.findOne({ userName: activeUser.username });
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
        const savedUserTimezone = currentUser.timezone;
        if (!savedUserTimezone || savedUserTimezone !== timezone) {
            currentUser.timezone = timezone;
            await currentUser.save();
            res.status(200).json("Timezone update successful");
        }
        else {
            res.status(200).json("Timezone already up to date");
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
};
exports.updateUserTimezone = updateUserTimezone;
