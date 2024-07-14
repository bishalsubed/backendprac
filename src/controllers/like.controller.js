import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!videoId || !videoId.trim()){
        throw new ApiError(404, "Video Not Found")
    } 
    try {
        const video = await Video.findById(videoId)
        if (!video) {
            throw new ApiError(404,'Video not found');
        }
        const user = await User.findById(req.user._id)
        if (!user) {
            throw new ApiError(404,'User not found');
        }
        const existingLike = await Like.findOne({ likedBy: user._id, video: video._id });
        if(existingLike){
            await Like.deleteOne({_id:existingLike._id})
            return res.status(200).json(200,"Video like toggled off successfully")
        }else{
            const newLike = new Like({likedBy: user._id, video: video._id })
            await newLike.save()
            return res.status(200).json(200,"Video like toggled on successfully")
        }

    } catch (error) {
        throw new ApiError(400,error?.message,"Error occured obtaining the video or User")
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!commentId || !commentId.trim()){
        throw new ApiError(404, "Video Not Found")
    } 
    try {
        const comment = await Video.findById(commentId)
        if (!comment) {
            throw new ApiError(404,'Video not found');
        }
        const user = await User.findById(req.user._id)
        if (!user) {
            throw new ApiError(404,'User not found');
        }
        const existingLike = await Like.findOne({ likedBy: user._id, comment: comment._id });
        if(existingLike){
            await Like.deleteOne({_id:existingLike._id})
            return res.status(200).json(200,"Comment like toggled off successfully")
        }else{
            const newLike = new Like({likedBy: user._id, comment: comment._id })
            await newLike.save()
            return res.status(200).json(200,"Comment like toggled on successfully")
        }

    } catch (error) {
        throw new ApiError(400,error?.message,"Error occured obtaining the comment or User")
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId || !tweetId.trim()){
        throw new ApiError(400, "Invalid TweetId")
    }
    try {
        const tweet = await Tweet. findById(tweetId)
        if(!tweet){
            throw new ApiError(400, "Tweet not found")
        }
        const user = await User.findById(req.user._id)
        if (!user) {
            throw new ApiError(404,'User not found');
        }
        const existingLike = await Like.findOne({likedBy:user._id,tweet:tweetId})
    
        if(existingLike){
           await Like.deleteOne({_id:existingLike._id})
           return res.status(200).json(200,"Tweet like toggled off successfully")
        }else{
            const newLike = new Like({likedBy:user._id,tweet:tweetId})
            await newLike.save()
            return res.status(200).json(200,"Tweet like toggled on successfully")
        }
    } catch (error) {
        
        throw new ApiError(400,error?.message,"Error occured obtaining the tweet or User")
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    try {
        const user = await User.findById(req.user._id)
        const likedVideos = await Like.find({likedBy:user._id}).populate("video")
        const likedVideosData = likedVideos.map(like => like.video);
    
        return res.status(200).json(likedVideosData);
    } catch (error) {
        throw new ApiError(400, error.message, "Error occurred while fetching liked videos");
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}