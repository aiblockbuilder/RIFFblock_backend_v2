import express from "express"
import userRoutes from "./user.routes"
import riffRoutes from "./riff.routes"
import collectionRoutes from "./collection.routes"
import stakeRoutes from "./stake.routes"
import tipRoutes from "./tip.routes"
import uploadRoutes from "./upload.routes"
import marketRoutes from "./market.routes"
import genreRoutes from "./genre.routes"
import tagRoutes from "./tag.routes"

const router = express.Router()

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

// API routes
router.use("/users", userRoutes)
router.use("/riffs", riffRoutes)
router.use("/collections", collectionRoutes)
router.use("/staking", stakeRoutes)
router.use("/tipping", tipRoutes)
router.use("/upload", uploadRoutes)
router.use("/marketplace", marketRoutes)
router.use("/genres", genreRoutes)
router.use("/tags", tagRoutes)

export default router
