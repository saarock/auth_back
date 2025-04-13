import express from "express";
import cors from "cors";
import dotenv from "dotenv";



dotenv.config();

const app = express();


app.use(cors({
    origin: "*",
    credentials: true,
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));



import userRouter from "./routers/user.router.js";
import productRouter from "./routers/product.router.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/users", productRouter);




export default app;