import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { BuyProduct, changeStatusOfTheBookeditems, deleteProducts, editTheProducts, generateBill,
     getAllProducts, getPurchaseStats, makeUnAvailable, manageBookedProduct, saveProduct } from "../controllers/product.controller.js";



const router = Router();

router.post("/saveProduct", verifyJWT, upload.single("product_image"), saveProduct);
router.get("/getProducts", verifyJWT, getAllProducts);
router.delete("/deleteProduct", verifyJWT, deleteProducts);
router.delete("/change-available", verifyJWT, makeUnAvailable);
router.put("/edit-product", verifyJWT, editTheProducts);
router.post("/buy-products", verifyJWT, BuyProduct);
router.get("/get-purchaseStats", verifyJWT, getPurchaseStats);
router.get("/manage-booked-product", verifyJWT, manageBookedProduct);
router.post("/change-status-of-booked-items", verifyJWT, changeStatusOfTheBookeditems)
router.get("/generate-bill", verifyJWT, generateBill)


export default router;
