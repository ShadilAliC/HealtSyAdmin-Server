import { Router } from "express"
import { uploadImages } from "../controllers/common.controller.js";
import { upload } from "../middlewares/multer.js";

const router = Router();



router.post('/upload', upload.array('images', 10), uploadImages)









export default router