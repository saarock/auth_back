import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: "djehjnmjm",
    api_key: "194295591139731",
    api_secret: "ccIjxmXFvgNJkg-k45hnqtsCC5I",
});

export const uploadOnCloudinary = async (filePath) => {

    console.log("Uploading file to Cloudinary...");
    console.log(process.env.CLOUDINARY_API_KEY);
    console.log(process.env.CLOUDINARY_API_SECRET);
    console.log(process.env.CLOUDINARY_CLOUD_NAME);
    if (!filePath) {
        console.error("File path is not provided.");
        return null;
    }

    try {
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto", // Automatically detect file type
        });

        console.log("File uploaded to Cloudinary successfully!");
        return response; // Return the response with the image URL and other data
    } catch (error) {
        console.error("Cloudinary upload failed:", error);

        // Check if file exists before deleting it
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Delete the file from local storage
            console.log("File deleted from local storage.");
        }

        // You can return a more specific error message, if needed
        return null;
    }
}
