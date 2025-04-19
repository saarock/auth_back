import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteProducts, editTheProducts, getAllProducts, makeUnAvailable, saveProduct } from "../controllers/product.controller.js";



const router = Router();

router.post("/saveProduct", verifyJWT, upload.single("product_image"), saveProduct);
router.get("/getProducts", verifyJWT, getAllProducts);
router.delete("/deleteProduct", verifyJWT, deleteProducts);
router.delete("/change-available", verifyJWT, makeUnAvailable);
router.put("/edit-product", verifyJWT, editTheProducts);



export default router;
