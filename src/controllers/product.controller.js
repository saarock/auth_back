import BuyProducts from "../models/buyProduct.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import moment from "moment"
import fs from "fs";
import Notification from "../models/notification.model.js";

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

export const BuyProduct = asyncHandler(async (req, res) => {
    try {
        const products = req.body;
        console.log(products);

        if (!products || products.length <= 0) {
            return res.status(404).json({ message: 'Product not found' });
        }




        // Use a for...of loop instead of forEach to handle async/await properly
        for (const product of products) {

            const alreadySavedProduct = await Product.findById(product.productId);
            if (!alreadySavedProduct) {
                throw new Error("No product found while buying Product");
            }

            if (alreadySavedProduct.stock <= 0) {
                return res.status(500).json({ message: "No stock available" });
            }

            // Update product stock
            alreadySavedProduct.stock -= parseInt(product.totalItem);

            // Save the updated product
            await alreadySavedProduct.save();

            // Record the purchase in BuyProducts
            await BuyProducts.create({
                user: product.userId,
                product: product.productId,
                price: parseInt(product.totalPrice),
                totalItems: parseInt(product.totalItem),

            });
            await Notification.create({
                user: product.userId,
                message: `You have purchase ${product.productName},  ${product.totalItem} items.`
            });
        }

        return res.status(200).json(new ApiResponse(200, null, "Product bought successfully"));

    } catch (error) {
        console.error("Error during product purchase:", error);
        return res.status(500).json({ message: error.message });
    }
});







export const getPurchaseStats = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.query;

        // Ensure the userId is provided
        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // Get the total number of completed purchases
        const totalCompletedPurchases = await BuyProducts.countDocuments({ user: userId, status: "completed" });

        // Get the total number of distinct users who have made purchases
        const totalUsersCount = await BuyProducts.distinct('user'); // List of unique users who made purchases

        // Get the total number of distinct products purchased
        const totalProductsCount = await BuyProducts.distinct('product'); // List of unique products purchased

        // Find all purchases for the user
        const userPurchases = await BuyProducts.find({ user: userId }, { createdAt: 1 }); // Only retrieve createdAt field

        // Extract the dates from the user purchases
        const purchaseDates = userPurchases.map(purchase => moment(purchase.createdAt).format("YYYY-MM-DD"));

        // If no purchases found, return empty stats
        if (purchaseDates.length === 0) {
            return res.status(200).json({
                totalCompletedPurchases,
                totalUsersCount: totalUsersCount.length, // Number of distinct users
                totalProductsCount: totalProductsCount.length, // Number of distinct products
                purchases: [] // Empty array if no data
            });
        }

        // Return the aggregated data
        return res.status(200).json({
            totalCompletedPurchases,
            totalUsersCount: totalUsersCount.length, // Total distinct users
            totalProductsCount: totalProductsCount.length, // Total distinct products
            purchases: purchaseDates // Only dates
        });
    } catch (error) {
        console.error("Error fetching purchase stats:", error);
        res.status(500).json({ message: error.message });
    }
});


// Controller to manage booked products
export const manageBookedProduct = asyncHandler(async (req, res) => {

    // Extract query parameters (with default values)
    const { page = 1, limit = 10, status, search = "", id } = req.query;


    if (!id || id === undefined || id === "undefined") {

        throw new Error("No id available")
    }
    // Find the user by id
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const skip = (page - 1) * limit; // Pagination skip logic


    // Admin logic (fetch all booked products)
    if (user.role === "admin") {
        // Search filter based on the search term (username search)
        const searchFilter = search
            ? { user: await User.findOne({ userName: { $regex: search, $options: "i" } }).select("_id") } // Find user by username
            : {}; // If no search term, no filter is applied


        const bookedProducts = await BuyProducts.find({
            ...searchFilter,
            status: status || { $in: ["pending", "completed", "cancelled"] },

        })
            .populate("user", "userName") // Populate with the username of the user who made the booking
            .populate("product", "name")
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 }); // Sort by newest bookings

        // Count the total number of booked products for pagination
        const total = await BuyProducts.countDocuments({
            ...searchFilter,

            status: status || { $in: ["pending", "completed", "cancelled"] },

        });

        return res.status(200).json({
            success: true,
            data: bookedProducts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit), // Calculate total pages
            },
        });
    }

    // User logic (fetch only the logged-in user's booked products)
    else {

        console.log(search + " ppppppppppppppppppppppppppppppppppp")
        // Search filter based on the search term (username search)
        const searchFilter = search
            ? { product: await Product.findOne({ name: { $regex: search, $options: "i" } }).select("_id") }
            : {}; // If no search term, no filter is applied


        const bookedProducts = await BuyProducts.find({
            user: user._id,
            status: status || { $in: ["pending", "completed", "cancelled"] },
            ...searchFilter,
        })
            .skip(skip)
            .populate("product", "name")
            .limit(Number(limit))
            .sort({ createdAt: -1 }); // Sort by newest bookings

        // Count the total number of bookings for the user
        const total = await BuyProducts.countDocuments({
            user: user._id,
            status: status || { $in: ["pending", "completed", "cancelled"] },
            ...searchFilter,
        });

        return res.status(200).json({
            success: true,
            data: bookedProducts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit), // Calculate total pages
            },
        });
    }
});




export const changeStatusOfTheBookeditems = asyncHandler(async (req, res) => {
    const { productId, newStatus } = req.body;

    if (!productId || !newStatus) {
        throw new Error("Product id and status were required");
    }
    const product = await BuyProducts.findById(productId);
    if (!product) {
        throw new Error("No product found");
    }

    product.status = newStatus;
    await product.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            product,
            "Product status changed successfull"
        )
    );



});



// Controller to generate the bill for a user
export const generateBill = asyncHandler(async (req, res) => {
    const { userId, status } = req.query;

    const products = await BuyProducts.find({ user: userId }).populate("product", "name price").populate("user", "userName");

    if (products.length <= 0) {
        throw new Error("No products found");
    }

    let totalPrice = 0;

    const allTheDetails = products.map((product) => {
        totalPrice += product.price;
        product.status = status;
        return {
            name: product.product.name,
            perPPrice: product.product.price,
            totalItems: product.totalItems,
            soTheMultiPrice: product.price,
            status: product.status,
        }
    });

    let anotherPrice = totalPrice;


    if (status) {
        await Promise.all(products.map(p => p.save()));
    }
    return res.status(200).json(
        new ApiResponse(200, {
            allTheDetails,
            anotherPrice,
            userName: products[0].user.userName
        })
    )



});
