"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeekOfMonth = exports.isSameDay = exports.stringToBoolean = void 0;
const stringToBoolean = (value) => {
    if (value.toLowerCase() === "true")
        return true;
    if (value.toLowerCase() === "false")
        return false;
    return undefined;
};
exports.stringToBoolean = stringToBoolean;
// Helper function to check if two dates are the same day
const isSameDay = (date1, date2) => {
    return (date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear());
};
exports.isSameDay = isSameDay;
// Calculate week of the month
const getWeekOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return Math.ceil((date.getDate() + firstDay.getDay()) / 7);
};
exports.getWeekOfMonth = getWeekOfMonth;
