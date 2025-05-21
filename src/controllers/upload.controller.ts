import type { Request, Response } from "express"
import logger from "../utils/logger"

const uploadController = {
  // Upload audio file
  uploadAudio: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" })
      }

      logger.info(`Uploaded audio file: ${req.file.filename}`)

      return res.status(200).json({
        message: "Audio file uploaded successfully",
        file: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: `/uploads/audio/${req.file.filename}`,
        },
      })
    } catch (error) {
      logger.error("Error in uploadAudio:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Upload image file
  uploadImage: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" })
      }

      logger.info(`Uploaded image file: ${req.file.filename}`)

      return res.status(200).json({
        message: "Image file uploaded successfully",
        file: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: `/uploads/images/${req.file.filename}`,
        },
      })
    } catch (error) {
      logger.error("Error in uploadImage:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },
}

export default uploadController
