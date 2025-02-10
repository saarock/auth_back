import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try {
        console.log("running")
        console.log('Mongo URI:', process.env.MONGODB_URI);
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n mongoDB connected !! DB Host: ${connectionInstance.connection.host}`);
        return connectionInstance;
    } catch (error) {
        console.error("MONGO_DB connection error: ", error);
        process.exit(1);
    }
};

export default connectDB;