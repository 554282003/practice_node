const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { User } = require("../models/user.model");
const { uploadOnCloudinary } = require("../utils/cloudnary");
const { ApiResponse } = require("../utils/ApiResponse");

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findOne(userId);
    const accesstoken = await user.generateAccessToken();
    const refreshtoken = await user.generateRefreshToken();

    user.refreshToken = refreshtoken;
    await user.save({ validateBeforeSave: false });

    return { accesstoken, refreshtoken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;
  console.log(username, email, fullname, password);
  console.log(req.files);
  if (!username || !email || !fullname || !password)
    if (
      [fullname, password, email, username].some(
        (field) => field?.trim() === ("" || undefined)
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }

  const existeduser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existeduser) {
    throw new ApiError(409, "User with email or username exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverLocalPath = req.files?.coverImage[0]?.path

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createduser) {
    throw new ApiError(500, "Somethin went wrong while creating new user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createduser, "User created"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const ispasswordvalid = await user.isPasswordCorrect(password);

  if (!ispasswordvalid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accesstoken, refreshtoken } = await generateAccessAndRefreshToken(
    user._id
  );
  // console.log(accesstoken, refreshtoken);

  const loggedInUser = await User.findById(user._id).select("-password");
  // console.log(loggedInUser);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accesstoken, options)
    .cookie("refreshToken", refreshtoken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accesstoken,
          refreshtoken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: " ",
      }
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200,{},"User logged out sucessfully"));
});

module.exports = { registerUser, loginUser, logoutUser };
