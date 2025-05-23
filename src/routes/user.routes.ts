import express from "express"
import { body, param } from "express-validator"
import userController from "../controllers/user.controller"
import uploadMiddleware from "../middlewares/upload.middleware"

const router = express.Router()

// Get user profile by wallet address
router.get("/:walletAddress", param("walletAddress").isString().notEmpty(), userController.getUserByWalletAddress)

// Update user profile
router.put(
  "/:walletAddress",
  param("walletAddress").isString().notEmpty(),
  body("name").optional().isString(),
  body("bio").optional().isString(),
  body("location").optional().isString(),
  body("twitterUrl").optional().isURL(),
  body("instagramUrl").optional().isURL(),
  body("websiteUrl").optional().isURL(),
  body("genres").optional().isArray(),
  body("influences").optional().isArray(),
  userController.updateUser,
)

// Get user's NFTs
router.get("/:walletAddress/nfts", param("walletAddress").isString().notEmpty(), userController.getUserNfts)

// Get user's collections
router.get(
  "/:walletAddress/collections",
  param("walletAddress").isString().notEmpty(),
  userController.getUserCollections,
)

// Get all activity
router.get("/all-activity", userController.getAllActivity)

// Get user's activity
router.get("/:walletAddress/activity", param("walletAddress").isString().notEmpty(), userController.getUserActivity)

// Get user's tipping tiers
router.get(
  "/:walletAddress/tipping-tiers",
  param("walletAddress").isString().notEmpty(),
  userController.getUserTippingTiers,
)

// Get user's favorites
router.get("/:walletAddress/favorites", param("walletAddress").isString().notEmpty(), userController.getUserFavorites)

// Get user's staking settings
router.get(
  "/:walletAddress/staking-settings",
  param("walletAddress").isString().notEmpty(),
  userController.getUserStakingSettings,
)

// Update user's staking settings
router.put(
  "/:walletAddress/staking-settings",
  param("walletAddress").isString().notEmpty(),
  userController.updateUserStakingSettings,
)

// Upload profile avatar
router.post("/upload-avatar", uploadMiddleware.single("avatar"), userController.uploadAvatar)

// Upload profile cover image
router.post("/upload-cover", uploadMiddleware.single("cover"), userController.uploadCover)

export default router
