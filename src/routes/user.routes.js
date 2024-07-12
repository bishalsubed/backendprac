import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1,

        },
        {
            name:"coverImage",
            maxCount:1,
        }
    ]),
    registerUser
)

router.route("/login").post(
    loginUser
)

router.route("/logout").post(verifyJwt, logoutUser)

router.route("/refresh-token").post(refreshToken)

router.route("/change-password").post(changeCurrentPassword)


router.route("/current-user").get(verifyJwt,getCurrentUser)


router.route("/update-account").patch(verifyJwt,updateAccountDetails)


router.route("/avatar").patch(verifyJwt,upload.single("avatar"),updateUserAvatar)


router.route("/coverImage").patch(verifyJwt,upload.single("coverImager"),updateUserCoverImage)

router.route("/c/:username").get(verifyJwt,getUserChannelProfile)

router.route("/history").get(verifyJwt,getWatchHistory)

export default router