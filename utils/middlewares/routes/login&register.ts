import { Request, Response, NextFunction } from "express";
import {
  genPassword,
  issueJWT,
  validatePassword,
} from "../../functions/authentication";
import user from "../../../models/user";
import { userSession } from "../../types";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

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

    if (!found) return res.status(404).json("User not found");

    const isValidUser = validatePassword(password, found.hash, found.salt);

    if (!isValidUser)
      return res.status(400).json("username or password invalid");

    const userSession: userSession = {
      _id: found._id,
      firstname: found.firstName,
      lastname: found.lastName,
      username: found.userName,
      auth_data: {
        token: "",
        expires: "",
        refreshToken: { value: "", version: 0 },
      },
    };

    const token = issueJWT(userSession);

    found.refreshToken = token.refreshToken;
    await found.save();

    userSession.auth_data.token = token.token;
    userSession.auth_data.expires = token.expires;
    userSession.auth_data.refreshToken = token.refreshToken;

    return res.status(200).json({ success: true, userSession });
  } catch (err) {
    next(err);
  }
};

const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const G_user = req.user as userSession | undefined;

    if (!G_user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await user.findByIdAndUpdate(G_user._id, {
      refrehToken: G_user.auth_data.refreshToken,
    });

    const token = issueJWT(G_user);
    G_user.auth_data = token;
    res.status(200).json({ success: true, userSession: G_user });
  } catch (err) {
    next(err);
  }
};

const appleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apple_user = req.user as userSession | undefined;

    if (!apple_user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await user.findByIdAndUpdate(apple_user._id, {
      refrehToken: apple_user.auth_data.refreshToken,
    });

    const token = issueJWT(apple_user);
    apple_user.auth_data = token;
    res.status(200).json({ success: true, userSession: apple_user });
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
      return res.status(400).json("Token not provided or empty");
    }

    const active_user = req.user as userSession;

    if (!active_user) {
      return res.status(401).json("Unauthorized");
    }

    const currentUser = await user.findById(active_user._id);

    if (!currentUser || !currentUser.refreshToken) {
      return res.status(401).json("Invalid user or no refresh token found");
    }

    const verifyToken = jsonwebtoken.verify(
      token,
      process.env.REFRESH_TOKEN_PRIVATE_KEY || ""
    ) as JwtPayload;

    if (!verifyToken) {
      return res.status(400).json("Could not verify token");
    }

    const currentVersion = currentUser.refreshToken.version ?? 0;

    if (verifyToken.version !== currentVersion) {
      return res.status(403).json("Invalid refresh token");
    }

    const newVersion = currentVersion + 1;
    const payload = {
      sub: currentUser.id,
      iat: Date.now(),
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

    if (!headerToken) return res.status(401).json("Unauthorized");

    const verifiedToken = jsonwebtoken.verify(
      headerToken,
      process.env.RSA_PRIVATE_KEY || ""
    ) as JwtPayload;

    if (!verifiedToken) return res.status(403).json("Invalid Token");

    const authenticatedUser = await user.findById(verifiedToken.sub);

    if (!authenticatedUser) return res.status(404).json("User not found");

    req.user = authenticatedUser;
    next();
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
};
