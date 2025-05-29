import multer from "multer"
import path from "path"
import fs from "fs"
import type { Request, Response, NextFunction } from "express"

// Ensure upload directories exist
const uploadDir = process.env.UPLOAD_DIR || "uploads"
const audioDir = path.join(uploadDir, "audio")
const imageDir = path.join(uploadDir, "images")

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true })
}

if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true })
}

// Configure multer for memory storage
const storage = multer.memoryStorage()

// File filter to allow audio and image files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check if the file is an audio file
    if (file.mimetype.startsWith("audio/")) {
        cb(null, true)
    }
    // Check if the file is an image file
    else if (file.mimetype.startsWith("image/")) {
        cb(null, true)
    }
    // Reject other file types
    else {
        cb(new Error("Only audio and image files are allowed"))
    }
}

// Configure upload middleware
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit for audio files
    },
})

// Add error handling middleware
const handleMulterError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: `File too large. Maximum size is ${Number.parseInt(process.env.MAX_FILE_SIZE || "25000000") / 1000000}MB` 
      })
    }
    return res.status(400).json({ error: err.message })
  }
  next(err)
}

export { handleMulterError }
