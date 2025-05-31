import express from "express"
import { param, query, body } from "express-validator"
import favoriteController from "../controllers/favorite.controller"

const router = express.Router()

// Get user's favorites
router.get(
    "/user/:walletAddress",
    param("walletAddress").isString().notEmpty(),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("offset").optional().isInt({ min: 0 }),
    favoriteController.getUserFavorites,
)

// Add to favorites
router.post(
    "/add",
    body("id").isInt(),
    body("walletAddress").isString().notEmpty(),
    favoriteController.addToFavorites,
)

// Remove from favorites
router.post(
    "/remove/:id/:walletAddress",
    param("id").isInt(),
    param("walletAddress").isString().notEmpty(),
    favoriteController.removeFromFavorites,
)

// Check if a riff is in user's favorites
router.get(
    "/check/:id/:walletAddress",
    param("id").isInt(),
    param("walletAddress").isString().notEmpty(),
    favoriteController.checkFavorite,
)

export default router
