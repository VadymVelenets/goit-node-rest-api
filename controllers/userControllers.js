import HttpError from "../helpers/HttpError.js";
import { User } from "../models/userModel.js";
import { createUser, findUser, changeAvatar, verificationUser } from "../services/userServices.js";
import { sendEMail } from "../services/emailService.js";

export const signUp = async (req, res, next) => {
  try {
    const userExist = await User.findOne({ email: req.body.email });
    if (userExist) {
      next(HttpError(409, "User already exist..."));
    }
    const newUser = await createUser(req.body);
    const { email, subscription } = newUser;
    res.status(201).json({ user: { email, subscription } });
  } catch (error) {
    next(error);
  }
};

export const logIn = async (req, res, next) => {
  try {
    const user = await findUser(req.body);
    if (!user) {
      next(HttpError(401));
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const logOut = async (req, res, next) => {
  try {
    await User.findOneAndUpdate({ token: req.body.token }, { token: null });
    res.status(204).send({
      status: "Success",
    });
  } catch (error) {
    next(error);
  }
};
export const currentUser = async (req, res, next) => {
  try {
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const newAvatar = async (req, res, next) => {
  try {
    const newUser = await changeAvatar(req.user, req.file);
    console.log(newUser);
    if (!newUser) {
      next(HttpError(401));
    }
    res.status(204).json({
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const user = await verificationUser(req.params.verificationToken);
    if (!user) {
      next(HttpError(404, "User not found"));
    }
    res.status(200).json({
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
};

export const resendMail = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) next(HttpError(401, "User doesnt exist"));
    if ((user.verificationToken = null)) next(HttpError(401, "User already verificated"));
    await sendEMail(user.email, user.verificationToken);
    res.status(200).json({
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }
};
