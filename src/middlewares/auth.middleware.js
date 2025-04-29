import { io } from "../app.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {


try {
        


    const token = req.headers.authorization?.split(" ")[1];
    const jwtSecret = process.env.ACCESS_TOKEN_SECRET;


    if (!jwtSecret || !token) {
        throw new ApiError(401, "Unauthorized request");
    }

  


   jwt.verify(token, jwtSecret, async (err, decoded) => {
        if (err || !decoded) {
            throw new ApiError(401, "Invalid or expired token");
        }

        req.user = decoded;
        console.log(decoded._id, "decoded")
        const user = await User.findById(decoded._id);
        if (!user.isActive) {
            return res.status(403).json({ message: "You are blocked pleased logout and contact us!" });
        }

        const totalNotifications = await Notification.countDocuments({ user: decoded._id, isRead: false });
        console.log(totalNotifications + "   this is the org")
        req.user.totalNotifications = totalNotifications;
        console.log(req.user.totalNotifications);
        next();
    });

} catch(error) {
    throw new ApiError(500, error?.message || "You are blocked");
}
   
});

