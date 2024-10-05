"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToBoolean = void 0;
const stringToBoolean = (value) => {
    if (value.toLowerCase() === "true")
        return true;
    if (value.toLowerCase() === "false")
        return false;
    return undefined;
};
exports.stringToBoolean = stringToBoolean;
