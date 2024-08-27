import { Request, Response, NextFunction } from "express";
import {
  genPassword,
  issueJWT,
  validatePassword,
} from "../../functions/authentication";
import user from "../../../models/user";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstname, lastname, username, password } = req.body;
    const hash = genPassword(password);

    console.log(firstname, lastname, username, hash);
    if (firstname && lastname && username && password && password !== "") {
      const newUser = new user({
        firstName: firstname,
        lastName: lastname,
        userName: username,
        hash: hash.hash,
        salt: hash.salt,
        createdAt: Date.now(),
      });
      await newUser.save();
      return res.status(200).send("registeration successful");
    }
    return res.status(400).send("missing fields!");
  } catch (err) {
    console.error(err);

    if (err instanceof Error) {
      if ("code" in err && err.code === 11000) {
        return res.status(409).json({ message: "Username is already taken" });
      }
      next(err);
    }
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

    const token = issueJWT(found);
    console.log(token);

    return res
      .status(200)
      .json({ success: true, token: token.token, expires: token.expires });
  } catch (err) {
    next(err);
  }
};

export { register, login };
