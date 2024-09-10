"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorMessage extends Error {
    constructor(message, code) {
        super();
        (this.message = message), (this.code = code);
    }
}
exports.default = ErrorMessage;
