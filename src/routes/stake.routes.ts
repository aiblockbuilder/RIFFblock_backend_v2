import express from "express"
import { body, param } from "express-validator"
import stakeController from "../controllers/stake.controller"

const router = express.Router()

// Get user's staked riffs
router.get("/user/:walletAddress", param("walletAddress").isString().notEmpty(), stakeController.getUserStakedRiffs)

// Get NFT staking info
router.get("/:nftId", param("nftId").isInt(), stakeController.getNftStakingInfo)

// Stake on an NFT
router.post(
  "/stake/:nftId/:walletAddress",
  param("nftId").isInt(),
  param("walletAddress").isString().notEmpty(),
  body("amount").isFloat({ min: 0.01 }),
  stakeController.stakeOnNft,
)

// Unstake from an NFT
router.post(
  "/unstake/:nftId/:walletAddress",
  param("nftId").isInt(),
  param("walletAddress").isString().notEmpty(),
  stakeController.unstakeFromNft,
)

// Claim royalties for user's staked riffs
router.post(
  "/claim-royalties/:walletAddress",
  param("walletAddress").isString().notEmpty(),
  body("claimedAmounts").isArray(),
  body("claimedAmounts.*.stakeId").isInt(),
  body("claimedAmounts.*.amount").isFloat({ min: 0 }),
  stakeController.claimRoyalties,
)

// Unstake from a specific stake (by stake ID)
router.post(
  "/unstake-stake/:stakeId/:walletAddress",
  param("stakeId").isInt(),
  param("walletAddress").isString().notEmpty(),
  stakeController.unstakeFromStake,
)

// Get total royalties earned from all stakes (active and inactive)
router.get(
  "/total-royalties/:walletAddress",
  param("walletAddress").isString().notEmpty(),
  stakeController.getTotalRoyaltiesEarned,
)

export default router
