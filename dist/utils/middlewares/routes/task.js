"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTask = void 0;
const addTask = (req, res, next) => {
    try {
        res.status(200).json("Hello World!");
    }
    catch (err) {
        console.log("Something went wrong Creating task", err);
        next(err);
    }
};
exports.addTask = addTask;
