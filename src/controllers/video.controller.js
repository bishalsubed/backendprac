import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy='CreatedAt', sortType="desc", userId } = req.query
    //TODO: get all videos based on query, sort, pagination
   const sortOptions = {};
   sortOptions[sortBy] = sortType==='asc'?1:-1;

   const filter = {}
   if(query){
    filter.$or = [
        {title:{$regex:query,$options:"i"}},
        {description:{$regex:query,$options:"i"}},
    ]
   };
   if(userId){
    filter.owner = userId
   }
   const skip = (page - 1) * limit;
   
   const videos = await Video.find(filter)
   .sortBy(sortOptions)
   .skip(skip)
   .limit(parseInt(limit))
   .populate('owner', 'username');

   const totalVideos = await Video.countDocuments(filter);
   const totalPages = Math.ceil(totalVideos/limit)

   return res.status(200).json(new ApiResponse(200, {
    videos,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
    totalVideos
}, "Videos fetched successfully"));

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!title || description) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findById(req.user._id)
    
    const videoFileLocalPath = req.files?.thumbnail[0]?.path
    if (!videoFileLocalPath) {
        throw new ApiError(400, `Video file is required`)
    }
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    if (!thumbnailLocalPath) {
        throw new ApiError(400, `Thumbnail file is required`)
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    
    const video = await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        title,
        description,
        duration:videoFile.duration,
        isPublished:true,
        owner:user,
    })
    return res.status(201).json(
        new ApiResponse(200, video, "Video Published Successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid VideoId")
    }

    //TODO: get video by id
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    res.status(200).json(new ApiResponse(200, video, "Obtained video from Id"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid VideoId")
    }
    //TODO: update video details like title, description, thumbnail
    const { title, description } = await req.body
    const thumbnailLocalPath = req.file?.path
    if (!thumbnailLocalPath) {
        throw new ApiError(400, `Thumbnail file is required`)
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnail.url) {
        throw new ApiError(400, "Error while updating the thumbnail")
    }
    if (!title || description) {
        throw new ApiError(400, "All fields are required")
    }
    const video = await Video.findByIdAndUpdate(videoId, {
        $set: {
            title,
            description,
            thumbnail: thumbnail.url
        },
    }, { set: true }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Details Updated Successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid VideoId")
    }
    //TODO: delete video
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "Video not found")
    }
    await Video.deleteOne({ _id: video._id })
    return res.status(200).json(new ApiResponse(200, "Video Deleted Successfully"))
})


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid VideoId")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    try {
        video.isPublished = !video.isPublished;

        await video.save();

        return res.status(200).json(
            new ApiResponse(200, video, "Updated Publish Status")
        )

    } catch (error) {
        throw new ApiError(400, " Unable to toggle publish statement")
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}