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
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }))

// Static files directory for uploads
app.use("/uploads", express.static("uploads"))

// API Routes
app.use("/api", routes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)

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
