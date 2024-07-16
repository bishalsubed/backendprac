import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    try {
        
        const reqBody = await req.body
        
        const user = await User.findById(req.user._id)
        
        const {tweetText} = reqBody
        
        if(!tweetText){
            throw new ApiError(400, `Cant find tweet`)
        }
        
        if (tweetText.trim().length === 0) {
            throw new ApiError(400, `Tweet field is required`)
        }
        
        const createdTweet = await Tweet.create({
            content:tweetText,
            owner:user
        })

        return res.status(201).json(
            new ApiResponse(201, createdTweet, "Tweet created Successfully")
        )

       
    } catch (error) {
        throw new ApiError(400,error?.message,"Problem in creating tweet")
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    try {
        const user = await User.findById(req.user._id)
        if(!user){
            throw new ApiError(404,"Cant find User to obtain tweets")
        }
        const tweets = await Tweet.find({owner:user._id})
        if(!tweets){
            throw new ApiError(404,"No tweets found")
        }

        return res.status(200).json(new ApiResponse(200,tweets,"Tweets Obtained Successfully"))



    } catch (error) {
        throw new ApiError(404,error?.message,"No tweets found")
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    try {
        const {tweetId} = req.params
        if (!isValidObjectId(tweetId)) {
            throw new ApiError(400, "Invalid tweetId format");
        }
        const {newTweet} = await req.body
        const tweet = await Tweet.findById(tweetId)
        if (!tweet) {
            throw new ApiError(404, "Unable to find tweet")
        }
        tweet.content = newTweet
        await tweet.save()
        return res.status(200).json(new ApiResponse(200, newTweet, "Tweet Updated Successfully"))
    } catch (error) {
        throw new ApiError(400,error?.message, "Unable to update tweet")
    }
    
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if (!tweetId) {
        throw new ApiError(404, "Unable to find tweet to delete")
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId format");
    }
    try {
        const tweet = await Tweet.findById(tweetId)
        if(!tweet){
            throw new ApiError(404, "Invalid tweet to delete")
        }
        await Tweet.deleteOne({_id:tweet._id})
        
        return res.status(200).json(new ApiResponsei(200,"Tweet deleted successfully"))
   
    } catch (error) {
        throw new ApiError(400,error?.message, "Unable to delete tweet")
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}