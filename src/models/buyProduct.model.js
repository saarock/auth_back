import { timeStamp } from "console";
import mongoose from "mongoose";
import { type } from "os";

const buyProductSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    totalItems: {
        type: Number,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending"
    }
},
{
    timestamps : true
}
);

const BuyProducts = mongoose.model("BuyProduct", buyProductSchema);
export default BuyProducts;




