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
const jsonwebtoken_1 = require("jsonwebtoken");
const redis_1 = require("../../../../config/redis");
globals_1.jest.mock("jsonwebtoken", () => ({
    verify: globals_1.jest.fn(),
}));
globals_1.jest.mock("../../../../config/redis", () => ({
    redis: {
        get: globals_1.jest.fn(),
    },
}));
// Mock request/response/next
const mockRequest = (body) => ({ body });
const mockValRequest = (headers) => ({ headers });
const mockGrequest = (user) => ({
    user,
});
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
        globals_1.expect.assertions(2);
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
        globals_1.expect.assertions(1);
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
    (0, globals_1.test)("Login returns session data", () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.expect.assertions(3);
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
        csrf_csrf_1.addCsrfToSession.mockImplementation((req, res, userSession) => {
            userSession.auth_data = Object.assign(Object.assign({}, userSession.auth_data), { csrf: "somegeneratedcsrftoken" });
            return userSession;
        });
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
                    refreshToken: globals_1.expect.objectContaining({
                        value: token.refreshToken.value,
                        version: 0,
                    }),
                    csrf: "somegeneratedcsrftoken",
                }),
            }),
        });
        (0, globals_1.expect)(foundUser.save).toHaveBeenCalled();
    }));
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        user_1.default.findOne.mockReset();
        authenticationModule.validatePassword.mockReset();
        authenticationModule.issueJWT.mockReset();
        csrf_csrf_1.addCsrfToSession.mockReset();
    });
    (0, globals_1.test)("Login throws error when user is not found", () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.expect.assertions(2);
        const req = mockRequest({
            username: "testuser",
            password: "Password@123",
        });
        const res = mockResponse();
        const next = mockNext;
        user_1.default.findOne.mockResolvedValueOnce(null);
        yield (0, login_register_1.login)(req, res, next);
        (0, globals_1.expect)(res.status).toHaveBeenCalledWith(404);
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith({ message: "User not found" });
    }));
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        user_1.default.findOne.mockReset();
        authenticationModule.validatePassword.mockReset();
        authenticationModule.issueJWT.mockReset();
        csrf_csrf_1.addCsrfToSession.mockReset();
    });
    (0, globals_1.test)("Login throws error when password is incorrect", () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.expect.assertions(2);
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
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith({
            message: "Username or password invalid",
        });
    }));
});
(0, globals_1.describe)("Authentication via google login returns with necessary session data and throws appropriate error", () => {
    (0, globals_1.describe)("Authentication via google login returns with necessary session data and throws appropriate error", () => {
        (0, globals_1.beforeEach)(() => {
            globals_1.jest.clearAllMocks();
        });
        (0, globals_1.test)("Authentication with google returns appropriate session data", () => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.expect.assertions(3);
            const req = mockGrequest({
                _id: "testuserid8728",
                firstname: "testuser",
                lastname: "taskify",
                username: "Googleuser99",
                auth_data: {
                    token: "somerandomlygeneratedToken",
                    expires: "1d",
                    refreshToken: { value: "newrefreshtoken", version: 0 },
                    csrf: "",
                },
            });
            const res = mockResponse();
            const next = mockNext;
            const foundUser = {
                _id: "testuserid8728",
                firstName: "testuser",
                lastName: "taskify",
                userName: "Googleuser99",
                google_profile: [],
                hash: "hashedpassword",
                salt: "somesalt",
                save: globals_1.jest.fn(),
            };
            const token = {
                token: "somerandomlygeneratedToken",
                expires: "1d",
                refreshToken: { value: "newrefreshtoken", version: 0 },
            };
            user_1.default.findOne.mockResolvedValueOnce(foundUser);
            authenticationModule.issueJWT.mockReturnValueOnce(token);
            csrf_csrf_1.addCsrfToSession.mockImplementation((req, res, userSession) => {
                return Object.assign(Object.assign({}, userSession), { auth_data: Object.assign(Object.assign({}, userSession.auth_data), { csrf: "somegeneratedcsrftoken" }) });
            });
            yield (0, login_register_1.googleAuth)(req, res, next);
            (0, globals_1.expect)(res.status).toHaveBeenCalledWith(200);
            (0, globals_1.expect)(res.json).toHaveBeenCalledWith({
                success: true,
                userSession: globals_1.expect.objectContaining({
                    _id: "testuserid8728",
                    firstname: "testuser",
                    lastname: "taskify",
                    username: "Googleuser99",
                    auth_data: globals_1.expect.objectContaining({
                        token: "somerandomlygeneratedToken",
                        expires: "1d",
                        refreshToken: globals_1.expect.objectContaining({
                            value: "newrefreshtoken",
                            version: 0,
                        }),
                    }),
                }),
            });
            (0, globals_1.expect)(foundUser.save).toHaveBeenCalled();
        }));
    });
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        user_1.default.findOne.mockReset();
        authenticationModule.validatePassword.mockReset();
        authenticationModule.issueJWT.mockReset();
        csrf_csrf_1.addCsrfToSession.mockReset();
    });
    (0, globals_1.test)("Google authentication returns appropriate errors when no request session available", () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.expect.assertions(2);
        const req = mockGrequest(null);
        const res = mockResponse();
        const next = mockNext;
        yield (0, login_register_1.googleAuth)(req, res, next);
        (0, globals_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    }));
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.test)("Google authentication return appropriate error when user not found", () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.expect.assertions(2);
        const req = mockGrequest({
            id: "testuserid8728",
            firstname: "testuser",
            lastname: "taskify",
            username: "Googleuser99",
            auth_data: {
                token: "somerandomlygeneratedToken",
                expires: "1d",
                refreshToken: { value: "newrefreshtoken", version: 0 },
                csrf: "",
            },
        });
        const res = mockResponse();
        const next = mockNext;
        user_1.default.findOne.mockResolvedValueOnce(null);
        yield (0, login_register_1.googleAuth)(req, res, next);
        (0, globals_1.expect)(res.status).toHaveBeenCalledWith(404);
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith({ message: "User not found" });
    }));
});
(0, globals_1.describe)("Refresh token returns a new token, blacklist previous token and returns appropriate errors", () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.test)("Refresh token return error when token not found", () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.expect.assertions(2);
        const req = mockRequest({ token: null });
        const res = mockResponse();
        const next = mockNext;
        yield (0, login_register_1.refreshToken)(req, res, next);
        (0, globals_1.expect)(res.status).toHaveBeenCalledWith(400);
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith({
            message: "Token not provided or empty",
        });
    }));
    (0, globals_1.test)("Refresh token returns appropriate error if authentication fails", () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.expect.assertions(2);
        const req = {
            user: null,
            body: { token: "someInvalidToken" },
        };
        const res = mockResponse();
        const next = mockNext;
        yield (0, login_register_1.refreshToken)(req, res, next);
        (0, globals_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    }));
    (0, globals_1.beforeEach)(() => {
        user_1.default.findById = globals_1.jest.fn();
    });
    (0, globals_1.test)("Refresh token blacklists token and return appropriate token error", () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.expect.assertions(2);
        const foundUser = {
            _id: "testuserid8728",
            firstName: "testuser",
            lastName: "taskify",
            userName: "Googleuser99",
            google_profile: [],
            hash: "hashedpassword",
            salt: "somesalt",
            refreshToken: {
                value: "currentRefreshToken",
                version: 1,
            },
        };
        const req = {
            user: {
                _id: "testuserid8728",
                firstname: "testuser",
                lastname: "taskify",
                username: "taskifyuser",
            },
            body: { token: "randomTokenvalue999" },
        };
        const res = mockResponse();
        const next = globals_1.jest.fn();
        user_1.default.findById.mockResolvedValue(foundUser);
        redis_1.redis.get.mockResolvedValue("blacklist_randomTokenvalue999");
        yield (0, login_register_1.refreshToken)(req, res, next);
        (0, globals_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith({
            message: "Token provided or refreshToken is invalid",
        });
    }));
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        user_1.default.findById = globals_1.jest.fn();
    });
    (0, globals_1.test)("Refresh token returns appropriate error if current user refresh token is blacklisted", () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.expect.assertions(2);
        const foundUser = {
            _id: "testuserid8728",
            firstName: "testuser",
            lastName: "taskify",
            userName: "Googleuser99",
            google_profile: [],
            hash: "hashedpassword",
            salt: "somesalt",
            refreshToken: {
                value: "currentRefreshToken",
                version: 1,
            },
        };
        const req = {
            user: {
                _id: "testuserid8728",
                firstname: "testuser",
                lastname: "taskify",
                username: "taskifyuser",
            },
            body: { token: "randomTokenvalue999" },
        };
        const res = mockResponse();
        const next = mockNext;
        user_1.default.findById.mockResolvedValue(foundUser);
        redis_1.redis.get.mockResolvedValue("blacklist_currentRefreshToken");
        yield (0, login_register_1.refreshToken)(req, res, next);
        (0, globals_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith({
            message: "Token provided or refreshToken is invalid",
        });
    }));
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        jsonwebtoken_1.verify.mockReset();
        user_1.default.findById.mockReset();
        redis_1.redis.get.mockReset();
    });
    (0, globals_1.test)("RefreshToken returns appropriate error when provided token is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.expect.assertions(2);
        const foundUser = {
            _id: "testuserid8728",
            firstName: "testuser",
            lastName: "taskify",
            userName: "Googleuser99",
            google_profile: [],
            hash: "hashedpassword",
            salt: "somesalt",
            refreshToken: {
                value: "currentRefreshToken",
                version: 1,
            },
        };
        const req = {
            user: {
                _id: "testuserid8728",
                firstname: "testuser",
                lastname: "taskify",
                username: "taskifyuser",
            },
            body: {
                token: "randomInvalidTokenValue999",
            },
        };
        const res = mockResponse();
        const next = mockNext;
        user_1.default.findById.mockResolvedValue(foundUser);
        redis_1.redis.get.mockResolvedValue(null);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        jsonwebtoken_1.verify.mockImplementation(async (token, secret) => {
            try {
                console.log(token);
            } catch (error) {
                throw new jsonwebtoken_1.JsonWebTokenError("Invalid signature or token");
            }
        });
        yield (0, login_register_1.refreshToken)(req, res, next);
        (0, globals_1.expect)(res.status).toHaveBeenCalledWith(403);
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith({
            message: "Invalid refresh token",
        });
    }));
});
(0, globals_1.describe)("ValidateAuthentication returns appropriate responses", () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        jsonwebtoken_1.verify.mockReset();
        user_1.default.findById.mockReset();
        redis_1.redis.get.mockReset();
    });
    (0, globals_1.test)("validateAuthentication returns appropriate error when token header not present", () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.expect.assertions(9);
        const req = mockValRequest({});
        const res = mockResponse();
        const next = mockNext;
        yield (0, login_register_1.validateAuthentication)(req, res, next);
        (0, globals_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith({ message: "unauthorized" });
        (0, globals_1.expect)(res.status).not.toHaveBeenCalledWith(403);
        (0, globals_1.expect)(res.json).not.toHaveBeenCalledWith({ message: "Invalid Token" });
        (0, globals_1.expect)(res.status).not.toHaveBeenCalledWith(400);
        (0, globals_1.expect)(res.json).not.toHaveBeenCalledWith({
            message: "Could not verify token",
        });
        (0, globals_1.expect)(res.status).not.toHaveBeenCalledWith(404);
        (0, globals_1.expect)(res.json).not.toHaveBeenCalledWith({ message: "User not found" });
        (0, globals_1.expect)(res.json).not.toHaveBeenCalledWith({
            message: "Token is no longer valid",
        });
    }));
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.test)("validateAuthentication returns appropriate error when token is blacklisted", () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.expect.assertions(9);
        const req = mockValRequest({
            authorization: "Bearer somerandomblacklistedtoken",
        });
        const res = mockResponse();
        const next = mockNext;
        redis_1.redis.get.mockResolvedValue("blacklist_somerandomblacklistedtoken");
        yield (0, login_register_1.validateAuthentication)(req, res, next);
        (0, globals_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith({
            message: "Token is no longer valid",
        });
        (0, globals_1.expect)(res.json).not.toHaveBeenCalledWith({ message: "unauthorized" });
        (0, globals_1.expect)(res.status).not.toHaveBeenCalledWith(403);
        (0, globals_1.expect)(res.json).not.toHaveBeenCalledWith({ message: "Invalid Token" });
        (0, globals_1.expect)(res.status).not.toHaveBeenCalledWith(400);
        (0, globals_1.expect)(res.json).not.toHaveBeenCalledWith({
            message: "Could not verify token",
        });
        (0, globals_1.expect)(res.status).not.toHaveBeenCalledWith(404);
        (0, globals_1.expect)(res.json).not.toHaveBeenCalledWith({ message: "User not found" });
    }));
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        redis_1.redis.get.mockReset();
    });
    (0, globals_1.test)("validateAuthentication returns appropriate error when header token is not valid", () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.expect.assertions(9);
        const req = mockValRequest({
            authorization: "Bearer somerandomtoken",
        });
        const res = mockResponse();
        const next = mockNext;
        redis_1.redis.get.mockResolvedValue(null);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        jsonwebtoken_1.verify.mockImplementation((token, secret) => {
            try {
                console.log(token);
            }
            catch (err) {
                throw new jsonwebtoken_1.JsonWebTokenError("Invalid signature or token");
            }
        });
        yield (0, login_register_1.validateAuthentication)(req, res, next);
        (0, globals_1.expect)(res.status).not.toHaveBeenCalledWith(401);
        (0, globals_1.expect)(res.json).not.toHaveBeenCalledWith({
            message: "Token is no longer valid",
        });
        (0, globals_1.expect)(res.json).not.toHaveBeenCalledWith({ message: "unauthorized" });
        (0, globals_1.expect)(res.status).toHaveBeenCalledWith(403);
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith({ message: "Invalid Token" });
        (0, globals_1.expect)(res.status).not.toHaveBeenCalledWith(400);
        (0, globals_1.expect)(res.json).not.toHaveBeenCalledWith({
            message: "Could not verify token",
        });
        (0, globals_1.expect)(res.status).not.toHaveBeenCalledWith(404);
        (0, globals_1.expect)(res.json).not.toHaveBeenCalledWith({ message: "User not found" });
    }));
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        redis_1.redis.get.mockReset();
        jsonwebtoken_1.verify.mockReset();
    });
    (0, globals_1.test)("validateAuthentication returns appropriate error when user is not found", () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.expect.assertions(9);
        const req = mockValRequest({
            authorization: "Bearer somerandomtoken",
        });
        const res = mockResponse();
        const next = mockNext;
        redis_1.redis.get.mockResolvedValue(null);
        jsonwebtoken_1.verify.mockReturnValue({ sub: "someuserid" });
        user_1.default.findById.mockResolvedValueOnce(false);
        yield (0, login_register_1.validateAuthentication)(req, res, next);
        (0, globals_1.expect)(res.status).toHaveBeenCalledWith(404);
        (0, globals_1.expect)(res.json).toHaveBeenCalledWith({ message: "User not found" });
        (0, globals_1.expect)(res.status).not.toHaveBeenCalledWith(401);
        (0, globals_1.expect)(res.json).not.toHaveBeenCalledWith({
            message: "Token is no longer valid",
        });
        (0, globals_1.expect)(res.json).not.toHaveBeenCalledWith({ message: "unauthorized" });
        (0, globals_1.expect)(res.status).not.toHaveBeenCalledWith(403);
        (0, globals_1.expect)(res.json).not.toHaveBeenCalledWith({ message: "Invalid Token" });
        (0, globals_1.expect)(res.status).not.toHaveBeenCalledWith(400);
        (0, globals_1.expect)(res.json).not.toHaveBeenCalledWith({
            message: "Could not verify token",
        });
    }));
});
