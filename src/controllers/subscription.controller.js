import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId =  req.user._id
    // TODO: toggle subscription
    if (!isValidObjectId(userId) || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid userId or channelId.");
    }
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(404,"Cant find User to toggle subscription")
    }
   try {
     const currentSubscription = await Subscription.findOne({subscriber:user._id,channel:channelId})
     if(currentSubscription){
       await currentSubscription.remove()
       return res.status(200).json(new ApiResponse(200,"Subscription toggled off successfully"))
     }else{
        const newSubscriber = new Subscription({_id:user._id, channel:channelId}) 
        await newSubscriber.save() 
        return res.status(200).json(new ApiResponse(200,newSubscriber,"Subscription toggled off successfully"))
     
     }
   } catch (error) {
    throw new ApiError(400,error?.message,"Problem toggling the subscription")
     }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user._id
    if (!isValidObjectId(userId) || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid userId or channelId.");
    }
   try {
     const user = await User.findById(userId)
     if(!user){
         throw new ApiError(404,"Can't find User while obtaining his channel subscribers")
     }
     const subscriber = await Subscription.find({channel:channelId})
     return res.status(200).json(new ApiResponse(200,subscriber,"Obtained the Suscribers successfully"))
   } catch (error) {
    throw new ApiError(400,error?.message,"Can't fetch channel subscribers")
   }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId.");
    }

    const user = await User.findById(subscriberId)
    try {
        const suscribedChannels= await Subscription.find({subscriber:subscriberId})
    } catch (error) {
        throw new ApiError(404,error?.message,"Can't fetch subscribed channels")
    }
    
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}