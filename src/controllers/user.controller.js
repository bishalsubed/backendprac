import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { response } from "express";

const registerUser = asyncHandler(async(req,res)=>{
    const reqBody  =await req.body
    const {username,email,fullName,password} = reqBody
    if ([username,email,fullName,password].some((field)=> field?.trim()===0)) {
        throw new ApiError(400, `All fields is required`)
    }
    const existedUser = User.findOne({
        $or:[{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, `User Already Exists`)
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, `Avatar file is required`)
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, `Avatar file is required`)
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, `Something went wrong while registering the user`)
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )

})

export {registerUser}