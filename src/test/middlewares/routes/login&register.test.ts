/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect, describe, jest, beforeEach } from "@jest/globals";
import {
  register,
  login,
  googleAuth,
  refreshToken,
  validateAuthentication,
} from "../../../../utils/middlewares/routes/login&register";
import user from "../../../../models/user";
import * as authenticationModule from "../../../../utils/functions/authentication";
import { addCsrfToSession } from "../../../../config/csrf-csrf";
import { userSession } from "../../../../utils/types";
import { Request, Response } from "express";
import { verify, JsonWebTokenError } from "jsonwebtoken";
import { redis } from "../../../../config/redis";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

jest.mock("../../../../config/redis", () => ({
  redis: {
    get: jest.fn(),
  },
}));

// Mock request/response/next
const mockRequest = (body: any) => ({ body });

const mockValRequest = (headers: any) => ({ headers });

const mockGrequest = (user: any) => ({
  user,
});

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

jest.mock("../../../../models/user", () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));

jest.mock("../../../../utils/functions/authentication", () => ({
  validatePassword: jest.fn(),
  issueJWT: jest.fn(),
  genPassword: jest.fn(),
}));

jest.mock("../../../../config/csrf-csrf", () => ({
  addCsrfToSession: jest.fn(),
}));

describe("Register route handles registration logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Register route returns 'User information updated successfully'", async () => {
    expect.assertions(2);

    const req = mockRequest({
      firstname: "John",
      lastname: "Doe",
      username: "johndoe",
      password: "password123",
    });

    const res = mockResponse();
    const next = mockNext;

    (user.findOne as jest.Mock<any>).mockResolvedValueOnce({
      google_profile: ["profileData"],
      hash: "taskify",
      salt: "taskify",
    });

    (user.findOneAndUpdate as jest.Mock<any>).mockResolvedValueOnce({});

    (authenticationModule.genPassword as jest.Mock).mockReturnValueOnce({
      salt: "mockedSalt",
      hash: "mockedHash",
    });

    await register(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User information updated successfully",
    });
  });

  test("Register route throws error and calls next", async () => {
    expect.assertions(1);

    const req = mockRequest({
      firstname: "John",
      lastname: "Doe",
      username: "johndoe",
      password: "password@123",
    });

    const res = mockResponse();
    const next = mockNext;

    (user.findOne as jest.Mock<any>).mockRejectedValueOnce(
      new Error("Database error")
    );

    await register(req as any, res as any, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("Login route handles login logic", () => {
  test("Login returns session data", async () => {
    expect.assertions(3);

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
      save: jest.fn(),
    };

    const token = {
      token: "somegeneratedtoken",
      expires: "1d",
      refreshToken: { value: "newrefreshtoken", version: 0 },
    };

    (user.findOne as jest.Mock<any>).mockResolvedValueOnce(foundUser);
    (authenticationModule.validatePassword as jest.Mock).mockReturnValueOnce(
      true
    );
    (authenticationModule.issueJWT as jest.Mock).mockReturnValueOnce(token);
    (addCsrfToSession as jest.Mock<any>).mockImplementation(
      (req: any, res: any, userSession: userSession) => {
        userSession.auth_data = {
          ...userSession.auth_data,
          csrf: "somegeneratedcsrftoken",
        };
        return userSession;
      }
    );

    await login(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      userSession: expect.objectContaining({
        _id: foundUser._id,
        firstname: foundUser.firstName,
        lastname: foundUser.lastName,
        username: foundUser.userName,
        auth_data: expect.objectContaining({
          token: token.token,
          expires: token.expires,
          refreshToken: expect.objectContaining({
            value: token.refreshToken.value,
            version: 0,
          }),
          csrf: "somegeneratedcsrftoken",
        }),
      }),
    });
    expect(foundUser.save).toHaveBeenCalled();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (user.findOne as jest.Mock).mockReset();
    (authenticationModule.validatePassword as jest.Mock).mockReset();
    (authenticationModule.issueJWT as jest.Mock).mockReset();
    (addCsrfToSession as jest.Mock).mockReset();
  });

  test("Login throws error when user is not found", async () => {
    expect.assertions(2);

    const req = mockRequest({
      username: "testuser",
      password: "Password@123",
    });

    const res = mockResponse();
    const next = mockNext;

    (user.findOne as jest.Mock<any>).mockResolvedValueOnce(null);

    await login(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (user.findOne as jest.Mock).mockReset();
    (authenticationModule.validatePassword as jest.Mock).mockReset();
    (authenticationModule.issueJWT as jest.Mock).mockReset();
    (addCsrfToSession as jest.Mock).mockReset();
  });

  test("Login throws error when password is incorrect", async () => {
    expect.assertions(2);

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

    (user.findOne as jest.Mock<any>).mockResolvedValueOnce(foundUser);
    (authenticationModule.validatePassword as jest.Mock).mockReturnValueOnce(
      false
    );

    await login(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Username or password invalid",
    });
  });
});

describe("Authentication via google login returns with necessary session data and throws appropriate error", () => {
  describe("Authentication via google login returns with necessary session data and throws appropriate error", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("Authentication with google returns appropriate session data", async () => {
      expect.assertions(3);

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
        save: jest.fn(),
      };

      const token = {
        token: "somerandomlygeneratedToken",
        expires: "1d",
        refreshToken: { value: "newrefreshtoken", version: 0 },
      };

      (user.findOne as jest.Mock<any>).mockResolvedValueOnce(foundUser);
      (authenticationModule.issueJWT as jest.Mock).mockReturnValueOnce(token);
      (addCsrfToSession as jest.Mock<any>).mockImplementation(
        (req: Request, res: Response, userSession: userSession) => {
          return {
            ...userSession,
            auth_data: {
              ...userSession.auth_data,
              csrf: "somegeneratedcsrftoken",
            },
          };
        }
      );

      await googleAuth(req as any, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        userSession: expect.objectContaining({
          _id: "testuserid8728",
          firstname: "testuser",
          lastname: "taskify",
          username: "Googleuser99",
          auth_data: expect.objectContaining({
            token: "somerandomlygeneratedToken",
            expires: "1d",
            refreshToken: expect.objectContaining({
              value: "newrefreshtoken",
              version: 0,
            }),
          }),
        }),
      });
      expect(foundUser.save).toHaveBeenCalled();
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (user.findOne as jest.Mock).mockReset();
    (authenticationModule.validatePassword as jest.Mock).mockReset();
    (authenticationModule.issueJWT as jest.Mock).mockReset();
    (addCsrfToSession as jest.Mock).mockReset();
  });

  test("Google authentication returns appropriate errors when no request session available", async () => {
    expect.assertions(2);

    const req = mockGrequest(null);
    const res = mockResponse();
    const next = mockNext;

    await googleAuth(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Google authentication return appropriate error when user not found", async () => {
    expect.assertions(2);

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

    (user.findOne as jest.Mock<any>).mockResolvedValueOnce(null);

    await googleAuth(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
});

describe("Refresh token returns a new token, blacklist previous token and returns appropriate errors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Refresh token return error when token not found", async () => {
    expect.assertions(2);

    const req = mockRequest({ token: null });
    const res = mockResponse();
    const next = mockNext;

    await refreshToken(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token not provided or empty",
    });
  });

  test("Refresh token returns appropriate error if authentication fails", async () => {
    expect.assertions(2);

    const req = {
      user: null,
      body: { token: "someInvalidToken" },
    };

    const res = mockResponse();
    const next = mockNext;

    await refreshToken(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  beforeEach(() => {
    (user.findById as jest.Mock) = jest.fn();
  });

  test("Refresh token blacklists token and return appropriate token error", async () => {
    expect.assertions(2);

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
    const next = jest.fn();

    (user.findById as jest.Mock<any>).mockResolvedValue(foundUser);

    (redis.get as jest.Mock<any>).mockResolvedValue(
      "blacklist_randomTokenvalue999"
    );

    await refreshToken(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token provided or refreshToken is invalid",
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (user.findById as jest.Mock) = jest.fn();
  });

  test("Refresh token returns appropriate error if current user refresh token is blacklisted", async () => {
    expect.assertions(2);

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

    (user.findById as jest.Mock<any>).mockResolvedValue(foundUser);

    (redis.get as jest.Mock<any>).mockResolvedValue(
      "blacklist_currentRefreshToken"
    );

    await refreshToken(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token provided or refreshToken is invalid",
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (verify as jest.Mock).mockReset();
    (user.findById as jest.Mock).mockReset();
    (redis.get as jest.Mock).mockReset();
  });

  test("RefreshToken returns appropriate error when provided token is invalid", async () => {
    expect.assertions(2);

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

    (user.findById as jest.Mock<any>).mockResolvedValue(foundUser);

    (redis.get as jest.Mock<any>).mockResolvedValue(null);

    (verify as jest.Mock<any>).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (token: any, secret: any) => {
        try {
          console.log(token);
        } catch (error) {
          throw new JsonWebTokenError("Invalid signature or token");
        }
      }
    );

    await refreshToken(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid refresh token",
    });
  });
});

describe("ValidateAuthentication returns appropriate responses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verify as jest.Mock).mockReset();
    (user.findById as jest.Mock).mockReset();
    (redis.get as jest.Mock).mockReset();
  });

  test("validateAuthentication returns appropriate error when token header not present", async () => {
    expect.assertions(9);

    const req = mockValRequest({});
    const res = mockResponse();
    const next = mockNext;

    await validateAuthentication(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "unauthorized" });
    expect(res.status).not.toHaveBeenCalledWith(403);
    expect(res.json).not.toHaveBeenCalledWith({ message: "Invalid Token" });
    expect(res.status).not.toHaveBeenCalledWith(400);
    expect(res.json).not.toHaveBeenCalledWith({
      message: "Could not verify token",
    });
    expect(res.status).not.toHaveBeenCalledWith(404);
    expect(res.json).not.toHaveBeenCalledWith({ message: "User not found" });
    expect(res.json).not.toHaveBeenCalledWith({
      message: "Token is no longer valid",
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("validateAuthentication returns appropriate error when token is blacklisted", async () => {
    expect.assertions(9);

    const req = mockValRequest({
      authorization: "Bearer somerandomblacklistedtoken",
    });
    const res = mockResponse();
    const next = mockNext;

    (redis.get as jest.Mock<any>).mockResolvedValue(
      "blacklist_somerandomblacklistedtoken"
    );
    await validateAuthentication(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token is no longer valid",
    });
    expect(res.json).not.toHaveBeenCalledWith({ message: "unauthorized" });
    expect(res.status).not.toHaveBeenCalledWith(403);
    expect(res.json).not.toHaveBeenCalledWith({ message: "Invalid Token" });
    expect(res.status).not.toHaveBeenCalledWith(400);
    expect(res.json).not.toHaveBeenCalledWith({
      message: "Could not verify token",
    });
    expect(res.status).not.toHaveBeenCalledWith(404);
    expect(res.json).not.toHaveBeenCalledWith({ message: "User not found" });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (redis.get as jest.Mock).mockReset();
  });

  test("validateAuthentication returns appropriate error when header token is not valid", async () => {
    expect.assertions(9);
    const req = mockValRequest({
      authorization: "Bearer somerandomtoken",
    });
    const res = mockResponse();
    const next = mockNext;

    (redis.get as jest.Mock<any>).mockResolvedValue(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (verify as jest.Mock).mockImplementation((token: any, secret: any) => {
      try {
        console.log(token);
      } catch (err) {
        throw new JsonWebTokenError("Invalid signature or token");
      }
    });

    await validateAuthentication(req as any, res as any, next);

    expect(res.status).not.toHaveBeenCalledWith(401);
    expect(res.json).not.toHaveBeenCalledWith({
      message: "Token is no longer valid",
    });
    expect(res.json).not.toHaveBeenCalledWith({ message: "unauthorized" });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid Token" });
    expect(res.status).not.toHaveBeenCalledWith(400);
    expect(res.json).not.toHaveBeenCalledWith({
      message: "Could not verify token",
    });
    expect(res.status).not.toHaveBeenCalledWith(404);
    expect(res.json).not.toHaveBeenCalledWith({ message: "User not found" });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (redis.get as jest.Mock).mockReset();
    (verify as jest.Mock).mockReset();
  });

  test("validateAuthentication returns appropriate error when user is not found", async () => {
    expect.assertions(9);
    const req = mockValRequest({
      authorization: "Bearer somerandomtoken",
    });

    const res = mockResponse();
    const next = mockNext;

    (redis.get as jest.Mock<any>).mockResolvedValue(null);

    (verify as jest.Mock<any>).mockReturnValue({ sub: "someuserid" });

    (user.findById as jest.Mock<any>).mockResolvedValueOnce(false);

    await validateAuthentication(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });

    expect(res.status).not.toHaveBeenCalledWith(401);
    expect(res.json).not.toHaveBeenCalledWith({
      message: "Token is no longer valid",
    });
    expect(res.json).not.toHaveBeenCalledWith({ message: "unauthorized" });
    expect(res.status).not.toHaveBeenCalledWith(403);
    expect(res.json).not.toHaveBeenCalledWith({ message: "Invalid Token" });
    expect(res.status).not.toHaveBeenCalledWith(400);
    expect(res.json).not.toHaveBeenCalledWith({
      message: "Could not verify token",
    });
  });
});
