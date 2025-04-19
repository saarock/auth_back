import { Router } from "express";
import {
    getAllUsers,
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
router.post("/logout", verifyJWT,logoutUser);
router.get("/get-users", verifyJWT, getAllUsers);
router.put("/deactivate-activate-user", verifyJWT, updateUserStatus);




// first manage this things and do all the stup
router.post("/verifyToken", verifyJWT, (req, res) => {
    try {
        return res.status(201).json(new ApiResponse(200, null, "Verified"));
    } catch (eror) {
        throw new ApiError(500, error?.message || "Something went wrong while login")
    }
});



export default router;
