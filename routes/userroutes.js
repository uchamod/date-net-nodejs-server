import express from "express";
import {
  followOrUnfollowUser,
  getAllUser,
  getCurrentUser,
  getUserByUserName,
} from "../controller/usercontroller.js";
import middleware from "../middleware/auth.js";
const userRouter = express.Router();

userRouter.get("/getalluser", middleware, getAllUser);
userRouter.get("/getcurrentuser", middleware, getCurrentUser);
userRouter.get("/getuserbyusername/:username", middleware, getUserByUserName);
userRouter.post("/followuser/:guestid", middleware, followOrUnfollowUser);

export default userRouter;
