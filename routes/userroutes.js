import express from "express";
import {
  getAllUser,
  getCurrentUser,
  getUserByUserName,
} from "../controller/usercontroller.js";
import middleware from "../middleware/auth.js";
const userRouter = express.Router();

userRouter.get("/getalluser", middleware, getAllUser);
userRouter.get("/getcurrentuser", middleware, getCurrentUser);
userRouter.get("/getuserbyusername/:username", middleware, getUserByUserName);

export default userRouter;
