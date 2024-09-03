"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoute = void 0;
const express_1 = __importDefault(require("express"));
exports.userRoute = express_1.default.Router();
exports.userRoute.post("/add", (req, res, next) => {
    try {
        res.status(200).json("Hello");
    }
    catch (err) {
        next(err);
    }
});
exports.userRoute.get("/add", (req, res, next) => {
    try {
        res.status(200).json("Hello");
    }
    catch (err) {
        next(err);
    }
});
