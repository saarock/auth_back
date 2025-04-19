import mongoose from "mongoose";



const productSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        trim: true
    },
    expiryDate: {
        type: Date,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    stock: {
        type: Number,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    isAvailable: {
        type: Boolean,  // Corrected field type
        default: true,  // You can set a default value (true or false)
      },

},
    { timestamps: true }
);



const Product = mongoose.model("Product", productSchema);
export default Product;