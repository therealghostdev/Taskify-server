import { Request, Response, NextFunction } from "express";
import user from "../../../models/user";
import { userSession } from "../../types";

const updateUserToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fcmToken } = req.body;

    const currentUser = req.user as userSession;

    const foundUser = await user.findOne({ userName: currentUser.username });

    if (!foundUser) return res.status(404).json({ message: "User not found" });

    const token = { token: fcmToken, timestamp: Date.now() };

    await user.updateOne({ _id: foundUser._id }, { fcmToken: token });

    res.status(200).json({ message: "Token updated" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export { updateUserToken };
