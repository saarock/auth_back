import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";




dotenv.config();

const app = express();
const server = http.createServer(app);

import { initSocket } from "./services/socket.service.js";

const io = initSocket(server);



app.use(cors({
    origin: "*",
    credentials: true,
}));




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));



import userRouter from "./routers/user.router.js";
import productRouter from "./routers/product.router.js";
import notificationRouter from "./routers/notification.router.js";


app.use("/api/v1/users", userRouter);
app.use("/api/v1/users", productRouter);
app.use("/api/v1/users", notificationRouter);





export default server;
export { io }