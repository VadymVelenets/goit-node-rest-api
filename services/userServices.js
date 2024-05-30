import { v4 as uuidv4 } from "uuid";
import { User } from "../models/userModel.js";
import { checkPasswordHash, createPasswordHash } from "./passwordHashService.js";
import HttpError from "../helpers/HttpError.js";
import { signToken } from "./jwtServices.js";
import { ImageService } from "./imageService.js";
import crypto from "crypto";

async function createUser(userData) {
  const password = await createPasswordHash(userData.password);
  const newUser = await User.create({ id: uuidv4(), ...userData, password, avatarURL });
  const hash = crypto.createHash("md5").update(userData.email).digest("hex");
  const avatarURL = `https://gravatar.com/avatar/${hash}.jpg?d=identicon`;
  newUser.password = undefined;
  return newUser;
}

async function findUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) next(HttpError(401));
  const isPasswordIsValid = await checkPasswordHash(password, user.password);
  if (!isPasswordIsValid) next(HttpError(401, "Data is incorrect.."));
  const token = signToken(user.id);
  user.token = token;
  await user.save();
  user.password = undefined;
  return user;
}

async function changeAvatar(user, file) {
  if (file) {
    user.avatarURL = await ImageService.saveImage(file);
    console.log(user.avatarURL);
    const newUser = await User.findByIdAndUpdate({ _id: user.id }, { avatarURL });
    return newUser;
  }
  return null;
}

export { createUser, findUser, changeAvatar };
