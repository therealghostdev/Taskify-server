
import {test, describe, expect, jest} from "@jest/globals"
import jsonwebtoken from "jsonwebtoken"
import { afterEach, beforeEach } from "node:test"
import { genPassword, validatePassword } from "../../utils/functions/authentication"
import crypto from "crypto"

jest.mock("jsonwebtoken")

describe("issue Jwt function", () => {
    
      const signedToken = "mocktoken"
    
      const refreshToken = "mocktoken"

      beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (jsonwebtoken.sign as jest.Mock).mockImplementation((payload, key, options: any) => {
            if(options.expiresIn === "1d"){
                return signedToken
            }else if(options.expiresIn === "7d"){
                return refreshToken
            }
        })
        process.env.RSA_PUBLIC_KEY = "mockpublickey"
      })
    
      test("Should return expect token vales for user session", () => {
        const result = {refreshToken: { value: refreshToken, version: 0 },
        token: "Bearer " + signedToken,
        expires: "1d",
        csrf: "",}

        expect(result).toEqual({
            refreshToken: { value: refreshToken, version: 0 },
            token: "Bearer " + signedToken,
            expires: "1d",
            csrf: "",
        })
      })

      afterEach(() => {
        jest.clearAllMocks()
      })
})

describe("issue password to newly registered users", () => {
  const userPassword = "randomPassword";

  test("expected output for password generation", () => {
    const result = genPassword(userPassword);

    expect(result.salt).toBeDefined();
    expect(result.hash).toBeDefined();

    expect(result.salt).toBeTruthy();
    expect(result.hash).toBeTruthy();

    expect(result.salt.length).toBeGreaterThan(10);
    expect(result.hash.length).toBeGreaterThan(10);
  });
})

describe("Check if user password is correct", () => {
  const salt = "somerandomgeneratedsaltvalue";
  const password = "mypassword"

  const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha512")
      .toString("hex");

  test("confirm password value", () => {
    const foundPassword = validatePassword(password, hash, salt);
    expect(foundPassword).toEqual(true)
  })
})