import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const { username } = req.params

    if (!(username?.trim())) {
        throw new ApiError(400, "Usename is missing")
    }
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const userId = user._id;

    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: userId
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                totalVideos: { $sum: 1 },
            }
        }
    ]);
    const totalLikes = await Like.countDocuments({
        video: { $in: user.videos }, // Assuming user.videos contains array of user's video IDs
        likedBy: { $ne: userId } // Count likes where likedBy is not the user themselves
    });
    return res.status(200).json(new ApiResponse(200,{
        totalViews: videoStats[0]?.totalViews || 0,
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalLikes,
    },"Successfully obtained channel stats"));

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user._id
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(400, "Unable to find the user")
    }
    const videos = await Video.find({ owner: user._id })
    return res.status(200).json(new ApiResponse(200, videos, "Successfully Obtained All the videos"))
})

export {
    getChannelStats,
    getChannelVideos
}