import Notification from "../models/notification.model.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const changeNotificationStatus = asyncHandler(async (req, res) => {
    const { notificationId,status } = req.body;
    const notification = await Notification.findById(notificationId);
    console.log(notification + " this is the notification " + status)
    if (!notification) {
        return res.status(400).json({ message: "No notification id. Notification id is required" });
    }

    notification.isRead = parseInt(status) === 0 ? false : true;
    await notification.save();
    // Return the aggregated data

    return res.status(200).json(new ApiResponse(200, null, "status change successfully"));

});
