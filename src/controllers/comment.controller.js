import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    const skip = (page - 1) * limit;

    const comments = await Comment.find({ video: videoId })
        .skip(skip)
        .limit(limit)
    res.status(200).json(new ApiResponse(200,comments,"Comments Obtained Successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {obtainedComment} = req.body
    if (!obtainedComment || obtainedComment.trim().length === 0) {
        throw new ApiError(400,"Comment cannot be empty");
      }
    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ApiError(400,"Unable to find user");
      }
    // TODO: add a comment to a video
    const addedComment = await Comment.create({
        content:obtainedComment,
        video: videoId,
        owner:user
    })
    return res.status(201).json(
        new ApiResponse(201, addedComment, "Comment Added Successfully")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    try {
        const {commentId} = req.params
        const {updatedComment} = req.body
        
        const comment = await Comment.findById(commentId)
        if (!comment) {
            throw new ApiError(404, "Comment not found")
        }
    
        comment.content = updatedComment
        await comment.save();
        return res.status(200).json(
            new ApiResponse(200, comment, "Comment Updated Successfully")
        )
    
    } catch (error) {
        throw new ApiError(400,error?.message,"Unable to Update the comment")
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    // TODO: delete a comment
    try {
        const comment = await Comment.findById(commentId)
        if (!comment) {
            throw new ApiError(404, "Comment not found")
        }
        await Comment.deleteOne({_id:comment._id})
        return res.status(200).json(
            new ApiResponse(200, comment, "Comment deleted Successfully")
        )
    } catch (error) {
        throw new ApiError(400,error?.message,"Unable to delete the comment")
    }
    
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}