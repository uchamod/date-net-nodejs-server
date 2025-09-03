import { response } from "express";
import jwt from "jsonwebtoken";
const jwtAuth = (req, res, next) => {
  const token = req.header("Authorization");
  //   const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ succss: false, massage: " authorization denied,Invalid user" });
  }
  try {
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decodeToken);
    req.user = decodeToken;
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);

    // Check if the error is due to token expiration
    if (err.name === "jwt expired") {
      return response
        .status(401)
        .json({ succss: false, massage: "Token has expired" });
    }

    // For other errors, respond with a generic message
    return res
      .status(400)
      .json({ succss: false, massage: "Token is not valid" });
  }
};
export default jwtAuth;
