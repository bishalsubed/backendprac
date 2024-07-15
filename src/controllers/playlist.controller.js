import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    //TODO: create playlist
    const user = await User.findById(req.user._id)
    if ([name, description].some((field) => field?.trim() === 0)) {
        throw new ApiError(400, `All fields is required`)
    }
    try {
        const createdPlaylist = await Playlist.create({
            name,
            description,
            owner: user
        })
        return res.status(201).json(
            new ApiResponse(200, createdPlaylist, "User Registered Successfully")
        )
    } catch (error) {
        throw new ApiError(400, error?.message, `Error creating playlist`)
    }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }
    //TODO: get user playlists
    try {
        const user = await User.findById(userId)

        if (!user) {
            throw new ApiError(404, `User with id ${userId} not found`);
        }

        const userPlaylist = await Playlist.find({ owner: user })

        return res.status(200).json(
            new ApiResponse(200, userPlaylist, "User Registered Successfully")
        )
    } catch (error) {
        throw new ApiError(400, `Error while extracting playlist`)
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(400, `Unable to find the playlist`)
    }
    return res.status(200).json(new ApiResponse(200, playlist, "Successfully Obtained Playlist By Id"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlistId or videoId");
    }
    //TODO: add video in playlist
    const playlist = await Playlist.findById(playlistId)
    const video = await Video.findById(videoId)
    if (!playlist || !video) {
        throw new ApiError(404, "Unable to find playlist or video")
    }
    try {
        playlist.videos.push(video._id)
        await playlist.save()
        return res.status(200).json(
            new ApiResponse(200, playlist, "Video added to playlist successfully")
        );
    } catch (error) {
        throw new ApiError(400, `Unable to Add the video to your playlist`)
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlistId or videoId");
    }
    const playlist = await Playlist.findById(playlistId)
    const video = await Video.findById(videoId)
    if (!playlist || !video) {
        throw new ApiError(404, "Unable to find playlist or video")
    }
    try {
        playlist.videos.remove(video._id)
        await playlist.save()

        return res.status(200).json(
            new ApiResponse(200, playlist, "Video removed from playlist successfully")
        );
    } catch (error) {
        throw new ApiError(400, `Unable to remove the video from your playlist`)
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }
    try {
        const playlist = await Playlist.findById(playlistId)

        if (!playlist) {
            throw new ApiError(400, `Unable to find the playlist to delete`)
        }

        await Playlist.deleteOne({ _id: playlist._id })

        return res.status(200).json(
            new ApiResponse(200, playlist, "Playlist removed successfully")
        );
    } catch (error) {
        throw new ApiError(400, error?.message, `Unable to delete the playlist`)
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

    if ([name, description].some((field) => field?.trim() === 0)) {
        throw new ApiError(400, `All fields is required`)
    }

    try {
        const playlist = await Playlist.findByIdAndUpdate(playlistId, {
            $set: {
                name,
                description
            },
        }, { set: true }
        )
        if (!playlist) {
            throw new ApiError(404, `Playlist with id ${playlistId} not found`);
        }
        return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Playlist Details Updated Successfully"))
    } catch (error) {
        throw new ApiError(400, error?.message, "Unable to update playlist details");
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}