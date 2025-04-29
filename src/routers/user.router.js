import { Router } from "express";
import {
    getAllUsers,
    getNotifications,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    sendMailToTheUser,
    updateUserStatus,
    verifyUserMail
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import ApiResponse from "../utils/apiResponse.js";
import { io } from "../app.js";
import connectedUsers from "../utils/connectedUsers.js";

const router = Router();

router.get("/", (req, res) => {
    res.status(200).json({
        message: "GET request to /user",
    });
});


router.post("/send_mail", sendMailToTheUser);
router.post("/mail_verify", verifyUserMail);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", verifyJWT, logoutUser);
router.get("/get-users", verifyJWT, getAllUsers);
router.put("/deactivate-activate-user", verifyJWT, updateUserStatus);
router.get("/get-notifications", verifyJWT, getNotifications);





// first manage this things and do all the stup
router.post("/verifyToken", verifyJWT, (req, res) => {
    try {
        const { totalNotifications, _id } = req.user;
        console.log(totalNotifications, "totalNotifications")
        if (io && parseInt(totalNotifications) > 0) {
            const userSocketId = connectedUsers.getUserSocketId(_id);
            console.log(userSocketId + " user socket id ")
            io.to(userSocketId).emit("notification", { totalNotifications });
        }
        return res.status(201).json(new ApiResponse(200, null, "Verified"));
    } catch (eror) {
        throw new ApiError(500, error?.message || "Something went wrong while login")
    }
});



export default router;
