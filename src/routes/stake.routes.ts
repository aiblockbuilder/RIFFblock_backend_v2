import express from "express"
import { body, param } from "express-validator"
import stakeController from "../controllers/stake.controller"

const router = express.Router()

// Get NFT staking info
router.get("/:nftId", param("nftId").isInt(), stakeController.getNftStakingInfo)

// Stake on an NFT
router.post(
  "/stake/:nftId/:walletAddress",
  param("nftId").isInt(),
  param("walletAddress").isString().notEmpty(),
  body("amount").isNumeric(),
  stakeController.stakeOnNft,
)

// Unstake from an NFT
router.post(
  "/unstake/:nftId/:walletAddress",
  param("nftId").isInt(),
  param("walletAddress").isString().notEmpty(),
  stakeController.unstakeFromNft,
)

export default router
