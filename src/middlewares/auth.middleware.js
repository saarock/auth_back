import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    console.log("checking token");


    const token = req.headers.authorization?.split(" ")[1];
    const jwtSecret = process.env.ACCESS_TOKEN_SECRET;


    if (!jwtSecret || !token) {
        throw new ApiError(401, "Unauthorized request");
    }

    console.log("hah");


    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err || !decoded) {
            throw new ApiError(401, "Invalid or expired token");
        }

        req.user = decoded;
        next();
    });
});

