"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initFirebase = void 0;
const app_1 = require("firebase-admin/app");
const initFirebase = () => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS;
    (0, app_1.initializeApp)({
        credential: (0, app_1.applicationDefault)(),
        projectId: "taskify-29c1e",
    });
};
exports.initFirebase = initFirebase;
