"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInputs = sanitizeInputs;
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
function sanitizeInputs(req, res, next) {
    const sanitizeOptions = {
        replaceWith: "_",
        onSanitize: ({ key, req }) => {
            console.warn(`Sanitized key: ${key} in request: ${req.originalUrl}`);
        },
    };
    req.body = express_mongo_sanitize_1.default.sanitize(req.body, sanitizeOptions);
    req.params = express_mongo_sanitize_1.default.sanitize(req.params, sanitizeOptions);
    req.query = express_mongo_sanitize_1.default.sanitize(req.query, sanitizeOptions);
    next();
}
