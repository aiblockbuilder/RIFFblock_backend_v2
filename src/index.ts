import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import dotenv from "dotenv"
import routes from "./routes"
import logger from "./utils/logger"
import db from "./models"

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: ["https://master.d3asxv52zxr30s.amplifyapp.com", "https://gateway.pinata.cloud", "https://api.pinata.cloud"],
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Content-Length", "X-Requested-With", "Accept", "Origin"]
}))

// Configure Helmet with more permissive settings
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "*"],
      scriptSrc: ["'self'", "'unsafe-inline'", "*"],
      styleSrc: ["'self'", "'unsafe-inline'", "*"],
      imgSrc: ["'self'", "data:", "https:", "*"],
      connectSrc: ["'self'", "*"]
    }
  }
}))

// Increase payload size limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }))

// Static files directory for uploads
app.use("/uploads", express.static("uploads"))

// API Routes
app.use("/api", routes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)

  // Handle file size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: {
        message: 'File too large. Maximum size is 50MB',
        status: 413,
      },
    });
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: {
        message: err.message,
        status: 400,
      },
    });
  }

  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500,
    },
  })
})

// Database connection and server start
db.sequelize
  .sync({ alter: process.env.NODE_ENV === "development" })
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
    })
  })
  .catch((err: Error) => {
    logger.error("Unable to connect to the database:", err)
  })

export default app
