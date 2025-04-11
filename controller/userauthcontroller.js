import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

dotenv.config();
//register new user
export const register = async (req, res) => {
  const { username, email, password } = req.body;
  const profileUrl = req.file ? req.file.buffer.toString("base64") : "";

  if (!username || !email || !password) {
    return res.status(400).json({ succss: false, massage: "missing details" });
  }
  // const profilePic = req.file?.filename || "";
  try {
    const isexistUser = await User.findOne({ email });
    if (isexistUser) {
      return res
        .status(400)
        .json({ succss: false, massage: "user already exist" });
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hasedPassword = await bcrypt.hash(password, salt);
    //save user
    const newUser = new User({
      username,
      email,
      password: hasedPassword,
      profileUrl,
    });

    const createdUser = await newUser.save();
    //gen session tokens

    const newToken = await jwt.sign(
      { id: createdUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.json({
      newToken,
      user: {
        username: createdUser.username,
        email: createdUser.email,
        id: createdUser._id,
        profileUrl: createdUser.profileUrl,
      },
    });
  } catch (err) {
    return res.status(404).json({ response: `${err}` });
  }
};
//user login
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ succss: false, massage: "enter all details" });
  }
  try {
    const existUser = await User.findOne({ username });
    if (!existUser) {
      return res
        .status(400)
        .json({ succss: false, massage: " user not found" });
    }
    //check password validation
    const isValidPassword = await bcrypt.compare(password, existUser.password);
    if (!isValidPassword) {
      return res
        .status(400)
        .json({ succss: false, massage: "invalid password" });
    }
    //gen new token
    const newToken = await jwt.sign(
      { id: existUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );
    //response-succsuss
    res.status(200).json({
      newToken,
      user: {
        id: existUser._id,
        username: existUser.username,
        email: existUser.email,
        profileUrl: existUser.profileUrl,
      },
    });
  } catch (err) {
    return res.status(404).json({ res: err });
  }
};
