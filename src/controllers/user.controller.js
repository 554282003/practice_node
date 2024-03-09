const {asyncHandler} = require('../utils/asyncHandler')
const {ApiError} = require('../utils/ApiError')
const {User} = require('../models/user.model')
const {uploadOnCloudinary} = require('../utils/cloudnary')
const {ApiResponse} = require("../utils/ApiResponse")

const registerUser = asyncHandler(async (req,res)=>{
    const {username,email,fullname,password} = req.body;
    if(!username || !email || !fullname || !password) 
    if([fullname,password,email,username].some((field) => field?.trim() === ("" || undefined) ))
    {
        throw new ApiError(400,"All fields are required")
    }

    const existeduser =  User.findOne({
        $or : [{username},{email}]
    })

    if(existeduser){
        throw new ApiError(409,"User with email or username exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverLocalPath = req.files?.coverImage[0]?.path
     
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    });

    const createduser = await User.findById(user._id).select("-password -refreshToken")

    if(!createduser){
        throw new ApiError(500,"Somethin went wrong while creating new user")
    }

    return res.status(201).json(
        new ApiResponse(200,createduser,"User created")
    )

})


module.exports={registerUser};