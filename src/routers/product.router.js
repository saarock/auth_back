import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { saveProduct } from "../controllers/product.controller.js";



const router = Router();

router.post("/saveProduct", verifyJWT, upload.single("product_image"), saveProduct);

export default router;
