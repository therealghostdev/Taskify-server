"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const globals_1 = require("@jest/globals");
const login_register_1 = require("../../../../utils/middlewares/routes/login&register");
const user_1 = __importDefault(require("../../../../models/user"));
const authenticationModule = __importStar(require("../../../../utils/functions/authentication"));
const csrf_csrf_1 = require("../../../../config/csrf-csrf");
// Mock request/response/next
const mockRequest = (body) => ({ body });
const mockResponse = () => {
    const res = {};
    res.status = globals_1.jest.fn().mockReturnValue(res);
    res.json = globals_1.jest.fn().mockReturnValue(res);
    return res;
};
const mockNext = globals_1.jest.fn();
globals_1.jest.mock("../../../../models/user", () => ({
    findOne: globals_1.jest.fn(),
    findOneAndUpdate: globals_1.jest.fn(),
}));
globals_1.jest.mock("../../../../utils/functions/authentication", () => ({
    validatePassword: globals_1.jest.fn(),
    issueJWT: globals_1.jest.fn(),
    genPassword: globals_1.jest.fn(),
}));
globals_1.jest.mock("../../../../config/csrf-csrf", () => ({
    addCsrfToSession: globals_1.jest.fn(),
}));
(0, globals_1.describe)("Register route handles registration logic", () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.test)("Register route returns 'User information updated successfully'", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = mockRequest({
            firstname: "John",
            lastname: "Doe",
            username: "johndoe",
            password: "password123",
        });
        const res = mockResponse();
        const next = mockNext;
        user_1.default.findOne.mockResolvedValueOnce({
            google_profile: ["profileData"],
            hash: "taskify",
            salt: "taskify",
        });
        user_1.default.findOneAndUpdate.mockResolvedValueOnce({});
        authenticationModule.genPassword.mockReturnValueOnce({
            salt: "mockedSalt",
            hash: "mockedHash",
        });
        yield (0, login_register_1.register)(req, res, next);
        (0, globals_1.expect)(res.status).toHaveBeenCalledWith(200);
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith({
            message: "User information updated successfully",
        });
    }));
    (0, globals_1.test)("Register route throws error and calls next", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = mockRequest({
            firstname: "John",
            lastname: "Doe",
            username: "johndoe",
            password: "password@123",
        });
        const res = mockResponse();
        const next = mockNext;
        user_1.default.findOne.mockRejectedValueOnce(new Error("Database error"));
        yield (0, login_register_1.register)(req, res, next);
        (0, globals_1.expect)(next).toHaveBeenCalledWith(globals_1.expect.any(Error));
    }));
});
(0, globals_1.describe)("Login route handles login logic", () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.test)("Login returns session data", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = mockRequest({
            username: "testuser",
            password: "Password@123",
        });
        const res = mockResponse();
        const next = mockNext;
        const foundUser = {
            _id: "dsdfjkklwe3338",
            firstName: "John",
            lastName: "Doe",
            userName: "testuser",
            hash: "hashedpassword",
            salt: "somesalt",
            refreshToken: { value: "oldrefreshtoken", version: 0 },
            save: globals_1.jest.fn(),
        };
        const token = {
            token: "somegeneratedtoken",
            expires: "1d",
            refreshToken: { value: "newrefreshtoken", version: 0 },
        };
        user_1.default.findOne.mockResolvedValueOnce(foundUser);
        authenticationModule.validatePassword.mockReturnValueOnce(true);
        authenticationModule.issueJWT.mockReturnValueOnce(token);
        csrf_csrf_1.addCsrfToSession.mockImplementation((req, res, userSession) => userSession);
        yield (0, login_register_1.login)(req, res, next);
        (0, globals_1.expect)(res.status).toHaveBeenCalledWith(200);
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith({
            success: true,
            userSession: globals_1.expect.objectContaining({
                _id: foundUser._id,
                firstname: foundUser.firstName,
                lastname: foundUser.lastName,
                username: foundUser.userName,
                auth_data: globals_1.expect.objectContaining({
                    token: token.token,
                    expires: token.expires,
                    refreshToken: token.refreshToken,
                }),
            }),
        });
        (0, globals_1.expect)(foundUser.save).toHaveBeenCalled();
    }));
    (0, globals_1.test)("Login throws error when user is not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = mockRequest({
            username: "testuser",
            password: "Password@123",
        });
        const res = mockResponse();
        const next = mockNext;
        user_1.default.findOne.mockResolvedValueOnce(null);
        yield (0, login_register_1.login)(req, res, next);
        (0, globals_1.expect)(res.status).toHaveBeenCalledWith(404);
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith("User not found");
    }));
    (0, globals_1.test)("Login throws error when password is incorrect", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = mockRequest({
            username: "testuser",
            password: "Password@123",
        });
        const res = mockResponse();
        const next = mockNext;
        const foundUser = {
            _id: "dsdfjkklwe3338",
            userName: "testuser",
            hash: "hashedpassword",
            salt: "somesalt",
            refreshToken: { value: "oldrefreshtoken", version: 0 },
        };
        user_1.default.findOne.mockResolvedValueOnce(foundUser);
        authenticationModule.validatePassword.mockReturnValueOnce(false);
        yield (0, login_register_1.login)(req, res, next);
        (0, globals_1.expect)(res.status).toHaveBeenCalledWith(400);
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith("username or password invalid");
    }));
});
