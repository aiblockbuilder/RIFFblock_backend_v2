import express from "express"
import { body, param } from "express-validator"
import tipController from "../controllers/tip.controller"

const router = express.Router()

// Send a tip
router.post(
  "/send",
  body("senderWalletAddress").isString().notEmpty(),
  body("recipientWalletAddress").isString().notEmpty(),
  body("riffId").optional().isInt(),
  body("amount").isNumeric(),
  body("currency").optional().isString(),
  body("message").optional().isString(),
  body("tierId").optional().isInt(),
  tipController.sendTip,
)

// Get tipping tiers for an artist
router.get("/tiers/:walletAddress", param("walletAddress").isString().notEmpty(), tipController.getTippingTiers)

// Create a tipping tier
router.post(
  "/tiers",
  body("walletAddress").isString().notEmpty(),
  body("name").isString().notEmpty(),
  body("amount").isNumeric(),
  body("description").optional().isString(),
  body("perks").optional().isArray(),
  tipController.createTippingTier,
)

// Update a tipping tier
router.put(
  "/tiers/:id",
  param("id").isInt(),
  body("name").optional().isString(),
  body("amount").optional().isNumeric(),
  body("description").optional().isString(),
  body("perks").optional().isArray(),
  tipController.updateTippingTier,
)

// Delete a tipping tier
router.delete(
  "/tiers/:id",
  param("id").isInt(),
  tipController.deleteTippingTier,
)

export default router
