import express from "express"
import { body, param, query } from "express-validator"
import riffController from "../controllers/riff.controller"
import uploadMiddleware from "../middlewares/upload.middleware"

const router = express.Router()

// Get all riffs with filtering
router.get(
  "/",
  query("genre").optional().isString(),
  query("mood").optional().isString(),
  query("instrument").optional().isString(),
  query("priceMin").optional().isNumeric(),
  query("priceMax").optional().isNumeric(),
  query("stakable").optional().isBoolean(),
  query("backstage").optional().isBoolean(),
  query("unlockable").optional().isBoolean(),
  query("sortBy").optional().isString(),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("offset").optional().isInt({ min: 0 }),
  riffController.getAllRiffs,
)

// Get riff by ID
router.get("/:id", param("id").isInt(), riffController.getRiffById)

// Get riff activity
router.get("/activity/:id", param("id").isInt(), riffController.getRiffActivity)

// Upload a new riff
router.post(
  "/upload",
  uploadMiddleware.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  body("title").isString().notEmpty(),
  body("description").optional().isString(),
  body("genre").optional().isString(),
  body("mood").optional().isString(),
  body("instrument").optional().isString(),
  body("keySignature").optional().isString(),
  body("timeSignature").optional().isString(),
  body("isBargainBin").optional().isBoolean(),
  body("collectionId").optional().isInt(),
  body("newCollectionName").optional().isString(),
  body("price").optional().isNumeric(),
  body("currency").optional().isString(),
  body("royaltyPercentage").optional().isInt({ min: 0, max: 100 }),
  body("isStakable").optional().isBoolean(),
  body("stakingRoyaltyShare").optional().isInt({ min: 0, max: 100 }),
  body("unlockSourceFiles").optional().isBoolean(),
  body("unlockRemixRights").optional().isBoolean(),
  body("unlockPrivateMessages").optional().isBoolean(),
  body("unlockBackstageContent").optional().isBoolean(),
  body("walletAddress").isString().notEmpty(),
  riffController.uploadRiff,
)

// Mint a riff as NFT
router.post("/:id/mint", param("id").isInt(), body("walletAddress").isString().notEmpty(), riffController.mintRiff)

// Get staking rewards for a riff
router.get(
  "/rewards/:id/:walletAddress",
  param("id").isInt(),
  param("walletAddress").isString().notEmpty(),
  riffController.getStakingRewards,
)

// Claim staking rewards
router.post(
  "/rewards-claim/:id/:walletAddress",
  param("id").isInt(),
  param("walletAddress").isString().notEmpty(),
  riffController.claimRewards,
)

// Add riff to favorites
router.post(
  "/favorite/add/:id/:walletAddress",
  param("id").isInt(),
  param("walletAddress").isString().notEmpty(),
  riffController.addToFavorites,
)

// Remove riff from favorites
router.post(
  "/favorite/remove/:id/:walletAddress",
  param("id").isInt(),
  param("walletAddress").isString().notEmpty(),
  riffController.removeFromFavorites,
)

export default router
