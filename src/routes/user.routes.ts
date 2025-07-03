import express from "express"
import { body, param } from "express-validator"
import userController from "../controllers/user.controller"
import { upload as uploadMiddleware } from "../middlewares/upload.middleware"

const router = express.Router()

// Get user profile by wallet address
router.get("/profile/:walletAddress", param("walletAddress").isString().notEmpty(), userController.getUserByWalletAddress)

// Create new user profile
router.post(
  "/profile",
  body("walletAddress").isString().notEmpty(),
  body("name").optional().isString(),
  body("bio").optional().isString(),
  body("location").optional().isString(),
  body("twitter").optional().isURL(),
  body("instagram").optional().isURL(),
  body("website").optional().isURL(),
  body("genres").optional().isArray(),
  body("influences").optional().isArray(),
  userController.createUser,
)

// Update user profile
router.put(
  "/profile/:walletAddress",
  param("walletAddress").isString().notEmpty(),
  body("name").optional().isString(),
  body("bio").optional().isString(),
  body("location").optional().isString(),
  body("twitter").optional().isURL(),
  body("instagram").optional().isURL(),
  body("website").optional().isURL(),
  body("genres").optional().isArray(),
  body("influences").optional().isArray(),
  userController.updateUser,
)

// Get user's NFTs
router.get("/profile/:walletAddress/nfts", param("walletAddress").isString().notEmpty(), userController.getUserNfts)

// Get user's riffs
router.get(
  "/profile/:walletAddress/riffs",
  param("walletAddress").isString().notEmpty(),
  userController.getUserRiffs,
)

// Get user's collections
router.get(
  "/profile/:walletAddress/collections",
  param("walletAddress").isString().notEmpty(),
  userController.getUserCollections,
)

// Get all activity
router.get("/all-activity", userController.getAllActivity)

// Get user's activity
router.get("/profile/:walletAddress/activity", param("walletAddress").isString().notEmpty(), userController.getUserActivity)

// Get user's tipping tiers
router.get(
  "/profile/:walletAddress/tipping-tiers",
  param("walletAddress").isString().notEmpty(),
  userController.getUserTippingTiers,
)

// Get user's favorites
router.get("/profile/:walletAddress/favorites", param("walletAddress").isString().notEmpty(), userController.getUserFavorites)

// Get user's staking settings
router.get(
  "/profile/:walletAddress/staking-settings",
  param("walletAddress").isString().notEmpty(),
  userController.getUserStakingSettings,
)

// Update user's staking settings
router.put(
  "/profile/:walletAddress/staking-settings",
  param("walletAddress").isString().notEmpty(),
  userController.updateUserStakingSettings,
)

// Upload profile avatar
router.post("/upload-avatar", uploadMiddleware.single("avatar"), userController.uploadAvatar)

// Upload profile cover image
router.post("/upload-cover", uploadMiddleware.single("cover"), userController.uploadCover)

// Get the most tipped user profile
router.get("/most-tipped", userController.getMostTippedUserProfile)

// Get trending creators sorted by uploaded riff counts
router.get("/trending-creators", userController.getTrendingCreators)

export default router
