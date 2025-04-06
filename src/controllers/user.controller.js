import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import nodeMailer from "../utils/mailSender.js";
import mailOtpStore from "../utils/mailOtpStore.js";
import jwt from "jsonwebtoken"



const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Error generating access and refresh token: " + error.message);
    }
}




const refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(403).json({ message: "Refresh token required." });
    }

    try {
        // console.log("yes: " + process.env.REFRESH_TOKEN_SECRET);

        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        // console.log(decoded);

        const user = await User.findById(decoded._id);
        console.log(user);


        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Generate a new access token
        const newAccessToken = await user.generateAccessToken();


        // Send the new access token back in the response
        return res.status(201).json(new ApiResponse(200, newAccessToken, "Register Successfull"));
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
})


/**
 * sends mail to the user to confrim the email
 */
const sendMailToTheUser = asyncHandler(async (req, res) => {
    console.log("request came")
    const { email } = req.body;
    console.log(email)
    if (!email) {
        throw new ApiError(400, "Mail is required");
    }
    const generateOtp = mailOtpStore.generateOtp();
    const storedOtp = mailOtpStore.storeOtp(email, generateOtp);
    if (!storedOtp) {
        throw new Error("Failed to generate or stored otp");
    }
    await nodeMailer.send("saarock200@gmail.com", email, "verify", `<b>${storedOtp}</b>`);
    res.status(200).json(new ApiResponse(200, null, "Mail send successfully"));
});


const verifyUserMail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const isCorrectOpt = mailOtpStore.verifyOtp(email, otp);
    if (!isCorrectOpt) {
        throw new ApiError(400, "Wrong otp");
    }
    res.status(200).json(new ApiResponse(200, null, "Otp verifyed"));
});


const registerUser = asyncHandler(async (req, res) => {
    try {
        const { fullName, userName, phoneNumber, email, password, role } = req.body;

        if (!fullName || !email || !phoneNumber || !password) {
            throw new ApiError(400, "All field are required");
        }


        const existedUser = await User.findOne({
            $or: [{ email }, { phoneNumber }, { userName }]
        });


        if (existedUser) {
            throw new ApiError(400, "User already exist.");
        }

        const user = await User.create(
            {
                fullName,
                email,
                userName,
                phoneNumber,
                password,
                role
            }
        );

        console.log(user);

        const createdUser = await User.findById((user)._id).select(
            "-password -refreshToken"
        );
        console.log("456");


        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user");

        }


        return res.status(201).json(new ApiResponse(200, createdUser, "Register Successfull"));

    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while login")

    }
});


const loginUser = asyncHandler(async (req, res) => {
    try {

        const { userName, email, password } = req.body;
        console.log("Login user");

        if (!(userName || email)) {
            throw new ApiError(400, "UserName or email requried");
        }

        const user = await User.findOne({
            $or: [{ userName }, { email }]
        });


        if (!user) {
            throw new ApiError(404, "User doesnot exit");
        }


        const passwordCorrect = user.isPasswordCorrect(password);
        if (!passwordCorrect) {
            throw new ApiError(401, "Incorrect Password.");

        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const { password: _, refreshToken: __, ...userWithoutSensativeData } = user.toObject();

        return res.status(201).json(new ApiResponse(200, { userWithoutSensativeData, accessToken, refreshToken }));

    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while login")
    }
});

const logoutUser = asyncHandler(async (req, res) => {

    if (!req.body.user) {
        throw new ApiError(400, "User doesnot found");
    }
    await User.findByIdAndUpdate(req.body.user._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true
        }
    );

    return res.status(200).json(new ApiResponse(200, {}, "User logged Out"));

});





export { registerUser, sendMailToTheUser, verifyUserMail, loginUser, refreshAccessToken, logoutUser }