import User from "../models/user.model.js";
//get current user details
export const getCurrentUser = async (req, res) => {
  const id = req.user.id;

  if (!id) {
    return res
      .status(401)
      .json({ success: false, massage: "Invalid infomation" });
  }
  try {
    const existUser = await User.findById(id);
    if (!existUser) {
      return res.status(404).json({ succss: false, massage: "user not found" });
    }
    return res.status(200).json({
      success: true,
      massage: "data fetched succsussfuly",
      user: existUser,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, massage: "Internal server error" });
  }
};
//get all user info : will update to all workers
export const getAllUser = async (req, res) => {
  try {
    const allUsers = await User.find({});

    return res.status(200).json({
      success: true,
      massage: "data fetched succsussfuly",
      users: allUsers,
    });
  } catch (err) {
    console.log(`error from get all user ${err}`);
    return res
      .status(500)
      .json({ success: false, massage: "Internal server error" });
  }
};
//get user/s by username
export const getUserByUserName = async (req, res) => {
  const { username } = req.params;
  if (!username) {
    return res.status(400).json({ success: false, massage: "empty parameter" });
  }
  try {
    // Create a case-insensitive regex pattern to find similar usernames
    const regex = new RegExp(username, "i");
    //get similer users by alphbatically sort and limited to 10
    const user = await User.find({ username: { $regex: regex } })
      .sort({ username: 1 })
      .limit(10);
    if (user === 0) {
      return res
        .status(404)
        .json({ success: false, massage: "User not found" });
    }
    return res.status(200).json({
      success: true,
      massage: "data fetched succsussfuly",
      users: user,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, massage: "Internal server error" });
  }
};
//follow and unfollow user
export const followOrUnfollowUser = async (req, res) => {
  const guestid = req.params.guestid;
  const userid = req.user.id;

  if (!userid || !guestid) {
    return res.status(400).json({ success: false, massage: "empty parameter" });
  }
  try {
    const guestUser = await User.findById(guestid);
    const currentUser = await User.findById(userid);
    if (!guestUser || !currentUser) {
      return res
        .status(404)
        .json({ success: false, massage: "user not found" });
    }
    //check already following
    if (guestUser.followers.includes(userid)) {
      //unfollow user
      //remove followres
      guestUser.followers = guestUser.followers.filter((id) => id !== userid);

      await guestUser.save();
      //remove followings
      currentUser.following = currentUser.following.filter(
        (id) => id !== guestid
      );

      await currentUser.save();

      return res.status(200).json({
        success: true,
        massage: "user unfollow",
        users: guestUser,
      });
    }
    //follow user
    guestUser.followers.push(userid);
    await guestUser.save();

    currentUser.following.push(guestid);
    await currentUser.save();
    return res.status(200).json({
      success: true,
      massage: "user follow",
      users: guestUser,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, massage: "Internal server error" });
  }
};
