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

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the destination based on file type
    const dest = file.mimetype.startsWith('audio/') ? audioDir : imageDir;
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for files
    files: 2 // Maximum 2 files (audio and cover)
  },
})

// Add error handling middleware
export const handleMulterError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: `File too large. Maximum size is 50MB` 
      })
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: `Too many files. Maximum is 2 files (audio and cover)` 
      })
    }
    return res.status(400).json({ error: err.message })
  }
  next(err)
}

// Add file validation middleware
// export const validateFiles = (req: Request, res: Response, next: NextFunction) => {
//   if (!req.files) {
//     return res.status(400).json({ error: "No files uploaded" });
//   }

//   const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  
//   if (!files.audio || files.audio.length === 0) {
//     return res.status(400).json({ error: "Audio file is required" });
//   }

//   const audioFile = files.audio[0];
//   if (!audioFile.mimetype.startsWith('audio/')) {
//     return res.status(400).json({ error: "Invalid audio file type" });
//   }

//   if (files.cover && files.cover.length > 0) {
//     const coverFile = files.cover[0];
//     if (!coverFile.mimetype.startsWith('image/')) {
//       return res.status(400).json({ error: "Invalid cover image type" });
//     }
//   }

//   next();
// }

