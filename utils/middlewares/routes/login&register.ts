import { Request, Response, NextFunction } from "express";
import {
  genPassword,
  issueJWT,
  validatePassword,
} from "../../functions/authentication";
import user from "../../../models/user";
import { userSession } from "../../types";

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
      cssrfToken: { token: "", expires: "" },
    };

    const token = issueJWT(userSession);
    userSession.cssrfToken.token = token.token;
    userSession.cssrfToken.expires = token.expires;

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

    console.log(req.user);

    const token = issueJWT(G_user);
    G_user.cssrfToken = token
    // G_user.cssrfToken.token = token.expires;
    console.log(token);
    res.status(200).json({ success: true, userSession: G_user });
  } catch (err) {
    next(err);
  }
};

export { register, login, googleAuth };
