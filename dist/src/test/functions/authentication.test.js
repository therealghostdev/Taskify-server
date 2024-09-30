"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_test_1 = require("node:test");
const authentication_1 = require("../../../utils/functions/authentication");
const crypto_1 = __importDefault(require("crypto"));
globals_1.jest.mock("jsonwebtoken");
(0, globals_1.describe)("issue Jwt function", () => {
    const signedToken = "mocktoken";
    const refreshToken = "mocktoken";
    (0, node_test_1.beforeEach)(() => {
        jsonwebtoken_1.default.sign.mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload, key, options) => {
            if (options.expiresIn === "1d") {
                return signedToken;
            }
            else if (options.expiresIn === "7d") {
                return refreshToken;
            }
        });
        process.env.RSA_PUBLIC_KEY = "mockpublickey";
    });
    (0, globals_1.test)("Should return expect token vales for user session", () => {
        const result = {
            refreshToken: { value: refreshToken, version: 0 },
            token: "Bearer " + signedToken,
            expires: "1d",
            csrf: "",
        };
        (0, globals_1.expect)(result).toEqual({
            refreshToken: { value: refreshToken, version: 0 },
            token: "Bearer " + signedToken,
            expires: "1d",
            csrf: "",
        });
    });
    (0, node_test_1.afterEach)(() => {
        globals_1.jest.clearAllMocks();
    });
});
(0, globals_1.describe)("issue password to newly registered users", () => {
    const userPassword = "randomPassword";
    (0, globals_1.test)("expected output for password generation", () => {
        const result = (0, authentication_1.genPassword)(userPassword);
        (0, globals_1.expect)(result.salt).toBeDefined();
        (0, globals_1.expect)(result.hash).toBeDefined();
        (0, globals_1.expect)(result.salt).toBeTruthy();
        (0, globals_1.expect)(result.hash).toBeTruthy();
        (0, globals_1.expect)(result.salt.length).toBeGreaterThan(10);
        (0, globals_1.expect)(result.hash.length).toBeGreaterThan(10);
    });
});
(0, globals_1.describe)("Check if user password is correct", () => {
    const salt = "somerandomgeneratedsaltvalue";
    const password = "mypassword";
    const hash = crypto_1.default
        .pbkdf2Sync(password, salt, 10000, 64, "sha512")
        .toString("hex");
    (0, globals_1.test)("confirm password value", () => {
        const foundPassword = (0, authentication_1.validatePassword)(password, hash, salt);
        (0, globals_1.expect)(foundPassword).toEqual(true);
    });
});
