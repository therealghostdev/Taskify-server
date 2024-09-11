/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect, describe, jest, beforeEach } from "@jest/globals";
import {
  register,
  login,
} from "../../../../utils/middlewares/routes/login&register";
import user from "../../../../models/user";
import * as authenticationModule from "../../../../utils/functions/authentication";
import { addCsrfToSession } from "../../../../config/csrf-csrf";
import { userSession } from "../../../../utils/types";

// Mock request/response/next
const mockRequest = (body: any) => ({ body });
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
    const req = mockRequest({
      firstname: "John",
      lastname: "Doe",
      username: "johndoe",
      password: "password@123",
    });

    const res = mockResponse();
    const next = mockNext;

    (user.findOne as jest.Mock<any>).mockRejectedValueOnce(new Error("Database error"));

    await register(req as any, res as any, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("Login route handles login logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Login returns session data", async () => {
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
      save: jest.fn(),
    };

    const token = {
      token: "somegeneratedtoken",
      expires: "1d",
      refreshToken: { value: "newrefreshtoken", version: 0 },
    };

    (user.findOne as jest.Mock<any>).mockResolvedValueOnce(foundUser);
    (authenticationModule.validatePassword as jest.Mock).mockReturnValueOnce(true);
    (authenticationModule.issueJWT as jest.Mock).mockReturnValueOnce(token);
    (addCsrfToSession as jest.Mock<any>).mockImplementation(
      (req: any, res: any, userSession: userSession) => userSession
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
          refreshToken: token.refreshToken,
        }),
      }),
    });
    expect(foundUser.save).toHaveBeenCalled();
  });

  test("Login throws error when user is not found", async () => {
    const req = mockRequest({
      username: "testuser",
      password: "Password@123",
    });

    const res = mockResponse();
    const next = mockNext;

    (user.findOne as jest.Mock<any>).mockResolvedValueOnce(null);

    await login(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith("User not found");
  });

  test("Login throws error when password is incorrect", async () => {
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
    (authenticationModule.validatePassword as jest.Mock).mockReturnValueOnce(false);

    await login(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith("username or password invalid");
  });
});