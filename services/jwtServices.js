import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";

export function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function checkToken(token) {
  if (!token) next(HttpError(401, "Unauthorized... no token"));
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    return id;
  } catch (error) {
    next(HttpError(401, "Unauthorized... error in checkToken"));
  }
}
