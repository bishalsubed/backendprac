import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async(req,res)=>{
    res.status(200).json({
        message:"Ok! Registered",
        success:true
    })
})

export {registerUser}