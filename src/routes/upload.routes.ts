import express from "express"
import uploadController from "../controllers/upload.controller"
import { upload as uploadMiddleware, handleMulterError } from "../middlewares/upload.middleware"

const router = express.Router()

// Upload audio file
router.post("/audio", uploadMiddleware.single("audio"), uploadController.uploadAudio)
router.use(handleMulterError)

// Upload image file
router.post("/image", uploadMiddleware.single("image"), uploadController.uploadImage)
router.use(handleMulterError)

export default router
