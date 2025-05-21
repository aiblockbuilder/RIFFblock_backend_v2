import express from "express"
import { body, param } from "express-validator"
import marketController from "../controllers/market.controller"

const router = express.Router()

// Get all listings
router.get("/listings", marketController.getAllListings)

// Get listing by ID
router.get("/listings/:id", param("id").isInt(), marketController.getListingById)

// Get sales history by ID
router.get("/sales/:id", param("id").isInt(), marketController.getSalesHistory)

// Update listing
router.put(
  "/listings/:id",
  param("id").isInt(),
  body("price").optional().isNumeric(),
  body("currency").optional().isString(),
  body("isActive").optional().isBoolean(),
  marketController.updateListing,
)

// Create new listing
router.post(
  "/listings",
  body("riffId").isInt(),
  body("sellerWalletAddress").isString().notEmpty(),
  body("price").isNumeric(),
  body("currency").optional().isString(),
  marketController.createListing,
)

// Buy a riff
router.post(
  "/buy",
  body("listingId").isInt(),
  body("buyerWalletAddress").isString().notEmpty(),
  marketController.buyRiff,
)

export default router
