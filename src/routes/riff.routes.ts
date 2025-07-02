import express, { RequestHandler } from "express"
import { body, param, query } from "express-validator"
import riffController from "../controllers/riff.controller"
import { upload as uploadMiddleware, handleMulterError, validateFiles } from "../middlewares/upload.middleware"

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
  query("search").optional().isString(),
  riffController.getAllRiffs,
)

// Get riff by ID
router.get("/riff/:id", param("id").isInt(), riffController.getRiffById)

// Get riff activity
router.get("/activity/:id", param("id").isInt(), riffController.getRiffActivity)

// Upload a new riff
router.post(
  "/upload",
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
  body("minimumStakeAmount").optional().isInt({ min: 1 }),
  body("lockPeriodDays").optional().isInt({ min: 1, max: 365 }),
  body("useProfileDefaults").optional().isBoolean(),
  body("unlockSourceFiles").optional().isBoolean(),
  body("unlockRemixRights").optional().isBoolean(),
  body("unlockPrivateMessages").optional().isBoolean(),
  body("unlockBackstageContent").optional().isBoolean(),
  body("walletAddress").isString().notEmpty(),
  body("duration").optional().isNumeric(),
  // IPFS data validation
  body("audioCid").isString().notEmpty(),
  body("coverCid").optional().isString(),
  body("metadataUrl").optional().isString(),
  // NFT data validation
  body("isNft").optional().isBoolean(),
  body("tokenId").optional().isString(),
  body("contractAddress").optional().isString(),

  riffController.uploadRiff as RequestHandler
)

// Mint a riff as NFT
router.post("/riff/:id/mint", param("id").isInt(), body("walletAddress").isString().notEmpty(), riffController.mintRiff)

// Get staking rewards for a riff
router.get(
  "/rewards/:id/:walletAddress",
  param("id").isInt(),
  param("walletAddress").isString().notEmpty(),
  riffController.getStakingRewards,
)

// Claim staking rewards
router.post(
  "/rewards-claim/riff/:id/:walletAddress",
  param("id").isInt(),
  param("walletAddress").isString().notEmpty(),
  riffController.claimRewards,
)

// Add riff to favorites
router.post(
  "/favorite/add/riff/:id/:walletAddress",
  param("id").isInt(),
  param("walletAddress").isString().notEmpty(),
  riffController.addToFavorites,
)

// Remove riff from favorites
router.post(
  "/favorite/remove/riff/:id/:walletAddress",
  param("id").isInt(),
  param("walletAddress").isString().notEmpty(),
  riffController.removeFromFavorites,
)

// Get the latest uploaded riff
router.get("/latest", riffController.getLatestRiff)

// Get a random riff
router.get("/random", riffController.getRandomRiff)

// Get riffs uploaded within the last week
router.get("/recent-uploads", riffController.getRecentUploads)

// Get stakable riffs for featured section
router.get("/stakable", riffController.getStakableRiffs)

export default router
