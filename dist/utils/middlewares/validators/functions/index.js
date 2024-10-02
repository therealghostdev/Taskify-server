"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTasksRequest = exports.validateLoginRequest = exports.validateRegisterRequest = void 0;
const schema_1 = require("../schema");
const validateRegisterRequest = (req, res, next) => {
    const { error } = schema_1.validateUserReg.validate(req.body);
    if (error) {
        return res.status(400).json(error.details[0].message);
    }
    next();
};
exports.validateRegisterRequest = validateRegisterRequest;
const validateLoginRequest = (req, res, next) => {
    const { error } = schema_1.validateUserLogin.validate(req.body);
    if (error)
        return res.status(400).json(error.details[0].message);
    next();
};
exports.validateLoginRequest = validateLoginRequest;
const validateTasksRequest = (req, res, next) => {
    const { error } = schema_1.validateTask.validate(req.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    next();
};
exports.validateTasksRequest = validateTasksRequest;
