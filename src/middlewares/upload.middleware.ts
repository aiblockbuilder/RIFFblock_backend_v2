import multer from "multer"
import path from "path"
import fs from "fs"
import type { Request, Express } from "express"

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

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    if (file.fieldname === "audio") {
      cb(null, audioDir)
    } else {
      cb(null, imageDir)
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + "-" + uniqueSuffix + ext)
  },
})

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === "audio") {
    // Accept only audio files
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true)
    } else {
      cb(new Error("Only audio files are allowed!"))
    }
  } else {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed!"))
    }
  }
}

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "25000000"), // Default 25MB
  },
})

export default upload
