import User from "../models/user.model.js";
//get current user details
export const getCurrentUser = async (req, res) => {
  const id = req.user.id;

  if (!id) {
    return res
      .status(401)
      .json({ succss: false, massage: "Invalid infomation" });
  }
  try {
    const existUser = await User.findById(id);
    if (!existUser) {
      return res.status(404).json({ succss: false, massage: "user not found" });
    }
    return res.status(200).json({
      succss: true,
      massage: "data fetched succsussfuly",
      user: existUser,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ succss: false, massage: "Internal server error" });
  }
};
//get all user info : will update to all workers
export const getAllUser = async (req, res) => {
  try {
    const allUsers = await User.find({});

    return res.status(200).json({
      succss: true,
      massage: "data fetched succsussfuly",
      users: allUsers,
    });
  } catch (err) {
    console.log(`error from get all user ${err}`);
    return res
      .status(500)
      .json({ succss: false, massage: "Internal server error" });
  }
};
//get user/s by username
export const getUserByUserName = async (req, res) => {
  const { username } = req.params.username;
  if (!username) {
    return res.status(404).json({ succss: false, massage: "User Not Found" });
  }
  try {
    const user = await User.find({ username });
    return res.status(200).json({
      succss: true,
      massage: "data fetched succsussfuly",
      users: user,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ succss: false, massage: "Internal server error" });
  }
};
