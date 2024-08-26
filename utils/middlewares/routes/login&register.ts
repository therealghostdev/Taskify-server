import { Request, Response, NextFunction } from "express";
import { genPassword } from "../../functions/authentication";
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
    res.send("login page");
  } catch (err) {
    next(err);
  }
};

export { register, login };
