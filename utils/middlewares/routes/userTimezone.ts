import { Request, Response, NextFunction } from "express";
import user from "../../../models/user";
import { userSession } from "../../types";

const updateUserTimezone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { timezone } = req.body;

    const activeUser = req.user as userSession;
    const currentUser = await user.findOne({ userName: activeUser.username });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const savedUserTimezone = currentUser.timezone;
    if (!savedUserTimezone || savedUserTimezone !== timezone) {
      currentUser.timezone = timezone;
      await currentUser.save();
      res.status(200).json("Timezone update successful");
    } else {
      res.status(200).json("Timezone already up to date");
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export { updateUserTimezone };
