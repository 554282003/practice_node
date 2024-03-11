const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // console.log(req.cookies?.accessToken);
    const token =
      req.cookies?.accessToken ||  req.header("Authorization")?.split(" ")[1] ;
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    // console.log(process.env.ACCESS_TOKEN_SECRET);
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password"
    );
      // console.log(user);
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

module.exports = {verifyJWT}