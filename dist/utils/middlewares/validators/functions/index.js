"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTasksUpdateRequestQparam = exports.validateTasksUpdateRequestBody = exports.validateTasksRequestQparam = exports.validateTasksRequest = exports.validateLoginRequest = exports.validateRegisterRequest = void 0;
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
const validateTasksRequestQparam = (req, res, next) => {
    const { error } = schema_1.validateTaskQuery.validate(req.query);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    next();
};
exports.validateTasksRequestQparam = validateTasksRequestQparam;
const validateTasksUpdateRequestBody = (req, res, next) => {
    const { error } = schema_1.validateTaskUpdate.validate(req.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    next();
};
exports.validateTasksUpdateRequestBody = validateTasksUpdateRequestBody;
const validateTasksUpdateRequestQparam = (req, res, next) => {
    const { error } = schema_1.validateTaskUpdateParam.validate(req.query);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    next();
};
exports.validateTasksUpdateRequestQparam = validateTasksUpdateRequestQparam;
