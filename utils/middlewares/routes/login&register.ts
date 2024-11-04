import { Request, Response, NextFunction } from "express";
import {
  genPassword,
  issueJWT,
  validatePassword,
  blacklistToken,
  createUserSession,
} from "../../functions/authentication";
import user from "../../../models/user";
import { CookieOptions, userSession } from "../../types";
import jsonwebtoken, { JwtPayload, JsonWebTokenError } from "jsonwebtoken";
import dotenv from "dotenv";
import { redis } from "../../../config/redis";
import { addCsrfToSession } from "../../../config/csrf-csrf";

dotenv.config();

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstname, lastname, username, password } = req.body;

    const { salt, hash } = genPassword(password);

    const existingUser = await user.findOne({ userName: username });

    if (existingUser) {
      if (
        existingUser.google_profile &&
        existingUser.google_profile.length > 0 &&
        existingUser.hash === "taskify" &&
        existingUser.salt === "taskify"
      ) {
        await user.findOneAndUpdate(
          { userName: username },
          {
            $set: {
              firstName: firstname,
              lastName: lastname,
              hash: hash,
              salt: salt,
            },
          },
          { new: true }
        );

        return res
          .status(200)
          .json({ message: "User information updated successfully" });
      } else {
        return res.status(409).json({ message: "Username is already taken" });
      }
    } else {
      const newUser = new user({
        firstName: firstname,
        lastName: lastname,
        userName: username,
        hash: hash,
        salt: salt,
        createdAt: Date.now(),
      });

      await newUser.save();
      return res.status(201).json({ message: "User registered successfully" });
    }
  } catch (err) {
    console.error(err);

    if (err instanceof Error) {
      if ("code" in err && err.code === 11000) {
        return res.status(409).json({ message: "Username is already taken" });
      }
    }
    next(err);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const found = await user.findOne({ userName: username });

    if (!found) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidUser = validatePassword(password, found.hash, found.salt);

    if (!isValidUser) {
      return res.status(400).json({ message: "Username or password invalid" });
    }

    let userSession: userSession = {
      _id: found._id,
      firstname: found.firstName,
      lastname: found.lastName,
      username: found.userName,
      auth_data: {
        token: "",
        expires: "",
        refreshToken: { value: "", version: 0 },
        csrf: "",
      },
    };

    const token = issueJWT(userSession);

    found.refreshToken = token.refreshToken;
    await found.save();

    userSession.auth_data.token = token.token;
    userSession.auth_data.expires = token.expires;
    userSession.auth_data.refreshToken = token.refreshToken;
    userSession = addCsrfToSession(req, res, userSession);

    console.log(req.session);

    console.log(req.session.cookie);
    console.log(req.cookies);

    // console.log(res.header("set-cookie"));

    // req.session.user = user as unknown as userSession

    return res.status(200).json({ success: true, userSession });
  } catch (err) {
    next(err);
  }
};

const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const G_user = req.user as userSession | undefined;

    const found = await user.findOne({ userName: G_user?.username });

    if (!G_user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!found) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = issueJWT(G_user);
    G_user.auth_data = token;

    found.refreshToken = token.refreshToken;
    await found.save();

    const sessionWithCsrf = addCsrfToSession(req, res, G_user);
    const sessionToken = sessionWithCsrf.auth_data.token;
    const token1 = sessionToken.split(" ")[1];

    res.cookie("token1", token1, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie("token2", sessionWithCsrf.auth_data.csrf, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie("token3", sessionWithCsrf.auth_data.refreshToken.value, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).redirect(process.env.FRONTEND_URL || "");
  } catch (err) {
    next(err);
  }
};

const appleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apple_user = req.user as userSession | undefined;

    const found = await user.findOne({ userName: apple_user });

    if (!apple_user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!found) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = issueJWT(apple_user);
    apple_user.auth_data = token;

    found.refreshToken = token.refreshToken;
    await found.save();

    const sessionWithCsrf = addCsrfToSession(req, res, apple_user);
    const sessionToken = sessionWithCsrf.auth_data.token;
    const token1 = sessionToken.split(" ")[1];

    res.cookie("token1", token1, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    res.cookie("token2", sessionWithCsrf.auth_data.csrf, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    res.cookie("token3", sessionWithCsrf.auth_data.refreshToken.value, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    res.status(200).redirect(process.env.FRONTEND_URL || "");
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token not provided or empty" });
    }

    const active_user = req.user as userSession;

    if (!active_user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const currentUser = await user.findById(active_user._id);
    const currentUserToken = currentUser?.refreshToken?.value;

    if (!currentUser || !currentUser.refreshToken) {
      return res
        .status(401)
        .json({ message: "Invalid user or no refresh token found" });
    }

    const isblacklisted = await redis.get(`blacklist_${token}`);

    const isblacklisted_current_token = await redis.get(
      `blacklist_${currentUserToken}`
    );

    if (isblacklisted || isblacklisted_current_token)
      return res
        .status(401)
        .json({ message: "Token provided or refreshToken is invalid" });

    let verifyToken;
    try {
      verifyToken = jsonwebtoken.verify(
        token,
        process.env.REFRESH_TOKEN_PRIVATE_KEY || ""
      ) as JwtPayload;
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        return res.status(401).json({ message: "Invalid signature or token" });
      }
      return res.status(400).json({ message: "Could not verify token" });
    }

    if (!verifyToken) {
      return res.status(400).json({ message: "Could not verify token" });
    }

    const currentVersion = currentUser.refreshToken.version ?? 0;

    if (verifyToken.version !== currentVersion) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    if (currentUserToken) {
      const expiry = Math.floor(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await blacklistToken(currentUserToken, expiry);
      await blacklistToken(token, expiry);
      console.log("token blacklisted");
    }

    const newVersion = currentVersion + 1;
    const payload = {
      sub: currentUser.id,
      iat: Date.now() / 1000,
      version: newVersion,
    };
    const issuedToken = jsonwebtoken.sign(
      payload,
      process.env.RSA_PRIVATE_KEY || "",
      { expiresIn: "1d", algorithm: "RS256" }
    );

    const refreshToken = jsonwebtoken.sign(
      payload,
      process.env.RSA_PRIVATE_KEY || "",
      { algorithm: "RS256" }
    );

    currentUser.refreshToken.value = refreshToken;
    currentUser.refreshToken.version = newVersion;

    await currentUser.save();

    res.status(200).json({ token: issuedToken });
  } catch (err) {
    next(err);
  }
};

const validateAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const headerToken = req.headers["authorization"]?.split(" ")[1];

    if (!headerToken) return res.status(401).json({ message: "unauthorized" });

    const isblacklisted = await redis.get(`blacklist_${headerToken}`);

    if (isblacklisted)
      return res.status(401).json({ message: "Token is no longer valid" });

    let verifyToken;
    try {
      verifyToken = jsonwebtoken.verify(
        headerToken,
        process.env.REFRESH_TOKEN_PRIVATE_KEY || ""
      ) as JwtPayload;
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        return res.status(401).json({ message: "Invalid signature or token" });
      }
      return res.status(400).json({ message: "Could not verify token" });
    }

    if (!verifyToken) return res.status(403).json({ message: "Invalid Token" });

    const authenticatedUser = await user.findById(verifyToken.sub);

    if (!authenticatedUser)
      return res.status(404).json({ message: "User not found" });

    req.user = createUserSession(authenticatedUser);
    req.session.user = createUserSession(authenticatedUser);

    next();
  } catch (err) {
    next(err);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const active_user = req.user as userSession;

    const authToken = req.headers["authorization"]?.split(" ")[1];

    if (authToken) {
      const decode = jsonwebtoken.decode(authToken) as JwtPayload;
      const expiry = decode.exp
        ? decode.exp - Math.floor(Date.now() / 1000)
        : Math.floor(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await blacklistToken(authToken, expiry);
    }

    await user.findByIdAndUpdate(active_user._id, {
      $unset: { refreshToken: 1 },
    });

    req.user = undefined;

    const cookieOptions: CookieOptions = {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      httpOnly: true,
      expires: new Date(0),
    };

    res.clearCookie("connect.sid", cookieOptions);

    process.env.NODE_ENV === "production"
      ? res.clearCookie("__Host-psifi.x-csrf-token", cookieOptions)
      : res.clearCookie("psifi.x-csrf-token", cookieOptions);

    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        res.clearCookie("connect.sid", cookieOptions);
        res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      res.status(200).json({ message: "Logged out successfully" });
    }
  } catch (err) {
    next(err);
  }
};

export {
  register,
  login,
  googleAuth,
  appleAuth,
  refreshToken,
  validateAuthentication,
  logout,
};
