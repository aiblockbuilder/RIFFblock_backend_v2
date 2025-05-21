import express from "express"
import uploadController from "../controllers/upload.controller"
import uploadMiddleware from "../middlewares/upload.middleware"

const router = express.Router()

// Upload audio file
router.post("/audio", uploadMiddleware.single("audio"), uploadController.uploadAudio)

// Upload image file
router.post("/image", uploadMiddleware.single("image"), uploadController.uploadImage)

export default router
