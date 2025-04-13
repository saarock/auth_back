import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

export const saveProduct = asyncHandler(async (req, res, next) => {
    const { name, description, price, expiryDate, stock, category, userId } = req.body;
    console.log(req.file);

    const newUser = await User.findById(userId);
    if (!newUser) {
        return res.status(404).json({ message: "User not found" });
    }

    console.log(newUser + "  this is the new user"); // Log the new user for debugging
    

    console.log(newUser.role);
    
    // Check if the user is an admin
    if (newUser.role !== "admin") {
        console.log(newUser.role + "  this is the role");
        return res.status(403).json({ message: "You are not authorized to add products" });
    }




    // Validate the product data
    if (!name || !description || !price) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if there's an image uploaded
    let imageUrl = null;
    if (req.file) {
        console.log("haha");

        // Upload the image to Cloudinary
        console.log(req.file.path + "  this is the path"); // Log the file path for debugging

        const cloudinaryResponse = await uploadOnCloudinary(req.file.path);


        if (cloudinaryResponse) {
            imageUrl = cloudinaryResponse.secure_url; // Get the URL of the uploaded image
        } else {
            return res.status(500).json({ message: "Image upload failed" });
        }

        // Optionally, remove the local file after uploading
        fs.unlinkSync(req.file.path);
        console.log(imageUrl + "  this is the image url"); // Log the image URL for debugging

    }

    // Create a new product object
    const newProduct = {
        name,
        description,
        price,
        userId: req.user.id, // Assuming you have the user ID from the JWT token
        imageUrl, // Save the image URL from Cloudinary
        expiryDate,
        stock,
        category,
        admin: newUser._id, // Assuming you have the admin ID from the JWT token
    };

    const product = new Product(newProduct);
    // Save the product to the database
    await product.save();
    res.status(201).json(new ApiResponse(200, "Register Successfull", product));
});