import express from "express"
import { body, param } from "express-validator"
import collectionController from "../controllers/collection.controller"
import uploadMiddleware from "../middlewares/upload.middleware"

const router = express.Router()

// Get all collections
router.get("/", collectionController.getAllCollections)

// Get collection by ID
router.get("/:id", param("id").isInt(), collectionController.getCollectionById)

// Create new collection
router.post(
  "/",
  body("name").isString().notEmpty(),
  body("description").optional().isString(),
  body("walletAddress").isString().notEmpty(),
  collectionController.createCollection,
)

// Upload collection cover image
router.post("/cover/:id", param("id").isInt(), uploadMiddleware.single("cover"), collectionController.uploadCover)

// Get NFTs in a collection
router.get("/nfts/:id", param("id").isInt(), collectionController.getCollectionNfts)

export default router
