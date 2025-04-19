import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

export const saveProduct = asyncHandler(async (req, res, next) => {
    const { name, description, price, expiryDate, stock, category, userId } = req.body;



    const newUser = await User.findById(userId);
    if (!newUser) {
        return res.status(404).json({ message: "User not found" });
    }




    // Check if the user is an admin
    if (newUser.role !== "admin") {

        return res.status(403).json({ message: "You are not authorized to add products" });
    }




    // Validate the product data
    if (!name || !description || !price) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if there's an image uploaded
    let imageUrl = null;
    if (req.file) {



        const cloudinaryResponse = await uploadOnCloudinary(req.file.path);


        if (cloudinaryResponse) {
            imageUrl = cloudinaryResponse.secure_url; // Get the URL of the uploaded image
        } else {
            return res.status(500).json({ message: "Image upload failed" });
        }

        // Optionally, remove the local file after uploading
        fs.unlinkSync(req.file.path);



    }

    // Create a new product object
    const newProduct = {
        name,
        description,
        price,
        imageUrl, // Save the image URL from Cloudinary
        expiryDate,
        stock,
        category,
        admin: newUser, // Assuming you have the admin ID from the JWT token
    };

    const product = new Product(newProduct);
    // Save the product to the database
    await product.save();
    res.status(201).json(new ApiResponse(200, "Product Added Successfull", product));
});






// Paginated getAllProducts route
export const getAllProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 4, search = '', categoryFilter = '', availabilityFilter = '', disabled = 2 } = req.query; // Default to page 1 and 4 items per page

    console.log("---- -- -- - --")
    console.log(availabilityFilter);
    console.log(categoryFilter);
    console.log(disabled);

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Calculate the skip value for MongoDB (which items to skip)
    const skip = (pageNumber - 1) * limitNumber;

    const filters = {};

    // Search filter
    if (search.trim()) {
        filters.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    // Category filter (if provided and not "2")
    if (categoryFilter !== '2' && categoryFilter.trim()) {
        filters.category = categoryFilter;
    }

    // Availability filter (if provided and not "2")
    if (availabilityFilter !== '2' && availabilityFilter.trim()) {
        if (availabilityFilter === '1') {
            // Products with stock > 0 (available)
            filters.stock = { $gt: 0 };  // More than 0 stock
        } else if (availabilityFilter === '0') {
            // Products with stock == 0 (out of stock)
            filters.stock = 0;  // Out of stock
        }
    }

    // Disabled filter (if not "2", handle availability status)
    if (disabled !== '2') {
        // "1" means disabled value to here only at other same upper rules
        filters.isAvailable = disabled !== '0';
    }

    try {
        const products = await Product.find(filters)
            .skip(skip)  // Skip the items based on pagination
            .limit(limitNumber); // Limit the number of items per page

        const totalProducts = await Product.countDocuments(filters); // Get the total number of products
        const totalPages = Math.ceil(totalProducts / limitNumber); // Calculate total pages

        res.status(200).json(new ApiResponse(200, {
            products,
            currentPage: pageNumber,
            totalPages,
            totalProducts
        }, "Products fetched successfully"));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



export const deleteProducts = asyncHandler(async (req, res) => {
    try {
        const { id } = req.body;  // The product ID should be in the request body


        // Check if the product exists
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            // If no product was found, return a 404 error
            return res.status(404).json({ message: 'Product not found' });
        }


        res.status(200).json(new ApiResponse(200, product
            , "Product deleted successfully",
        ));
    } catch (error) {
        // In case of an error, send a 500 status with the error message
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

export const makeUnAvailable = asyncHandler(async (req, res) => {
    try {
        const { id } = req.body;  // The product ID should be in the request body


        // Check if the product exists
        const product = await Product.findById(id);
        if (!product) {
            // If no product was found, return a 404 error
            return res.status(404).json({ message: 'Product not found' });
        }


        product.isAvailable = !product.isAvailable;

        await product.save();



        res.status(200).json(new ApiResponse(200, product
            , "Unavailable successfully",
        ));
    } catch (error) {
        // In case of an error, send a 500 status with the error message
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});



export const editTheProducts = asyncHandler(async (req, res) => {
    const { productDetails } = req.body;

    // Validate product details
    if (!productDetails || typeof productDetails !== 'object') {
        return res.status(400).json({ message: 'Product details are required and must be an object.' });
    }

    const { id, name, description, price, stock } = productDetails;

    // Check if all required fields are provided and not null, undefined, or empty
    if (id == null || id === undefined || id.trim() === '') {
        return res.status(400).json({ message: 'Product ID is required and should not be empty.' });
    }

    if (name == null || name === undefined || name.trim() === '') {
        return res.status(400).json({ message: 'Product name is required and should not be empty.' });
    }

    console.log(price)
    if (price == null || price === undefined || price <= 0) {
        return res.status(400).json({ message: 'Product price should be a positive number.' });
    }

    console.log(stock)
    if (stock == null || stock === undefined || stock < 0) {
        return res.status(400).json({ message: 'Product stock should be a non-negative number.' });
    }
    if (description == null || description === undefined || description.trim() === '') {
        return res.status(400).json({ message: 'Descriptions should be not empty, null or undefined' });
    }


    // Validate field types
    if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid id format.' });
    }

    if (typeof name !== 'string') {
        return res.status(400).json({ message: 'Product name should be a string.' });
    }

    if (description && typeof description !== 'string') {
        return res.status(400).json({ message: 'Product description should be a string if provided.' });
    }



    try {
        // Proceed with updating the product (replace the following line with your update logic)


        // Assuming you have a Product model and a method to update the product
        const updatedProduct = await Product.findByIdAndUpdate(id, {
            ...productDetails,
            stock: parseInt(stock),
            price: parseInt(price)
        }, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Respond with the updated product details
        res.status(200).json(new ApiResponse(200, updatedProduct, "Product edited successfully"));

    } catch (error) {
        // Handle unexpected errors
        res.status(500).json({ message: error.message });
    }
});