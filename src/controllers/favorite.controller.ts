import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import db from "../models"
import logger from "../utils/logger"

const User = db.User
const Riff = db.Riff
const Favorite = db.Favorite

const favoriteController = {
    // Get user's favorites
    getUserFavorites: async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            const { walletAddress } = req.params
            const { limit = 20, offset = 0 } = req.query

            // Find user
            const user = await User.findOne({ where: { walletAddress } })

            if (!user) {
                return res.status(404).json({ error: "User not found" })
            }

            // Get favorites with pagination
            const favorites = await user.getFavoritedRiffs({
                limit: Number.parseInt(limit as string),
                offset: Number.parseInt(offset as string),
                include: [{ model: User, as: "creator", attributes: ["id", "name", "walletAddress", "avatar"] }],
                order: [["createdAt", "DESC"]],
            })

            // Get total count
            const totalCount = await Favorite.count({ where: { userId: user.id } })

            return res.status(200).json({
                total: totalCount,
                favorites,
                limit: Number.parseInt(limit as string),
                offset: Number.parseInt(offset as string),
            })
        } catch (error) {
            logger.error("Error in getUserFavorites:", error)
            return res.status(500).json({ error: "Internal server error" })
        }
    },

    // Add to favorites
    addToFavorites: async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            const { id, walletAddress } = req.body
            console.log(`>>> id : ${id}, walletAddress : ${walletAddress}`)

            // Find user
            const user = await User.findOne({ where: { walletAddress } })

            if (!user) {
                return res.status(404).json({ error: "User not found" })
            }

            // Find riff
            const riff = await Riff.findByPk(id)

            if (!riff) {
                return res.status(404).json({ error: "Riff not found" })
            }

            // Check if already favorited
            const favorite = await Favorite.findOne({
                where: {
                    userId: user.id,
                    riffId: riff.id,
                },
            })

            if (favorite) {
                return res.status(400).json({ error: "Riff already in favorites" })
            }

            // Add to favorites
            await Favorite.create({
                userId: user.id,
                riffId: riff.id,
            })

            logger.info(`Added riff ${id} to favorites for user: ${walletAddress}`)

            return res.status(200).json({
                message: "Added to favorites",
            })
        } catch (error) {
            logger.error("Error in addToFavorites:", error)
            return res.status(500).json({ error: "Internal server error" })
        }
    },

    // Remove from favorites
    removeFromFavorites: async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            const { id, walletAddress } = req.params

            // Find user
            const user = await User.findOne({ where: { walletAddress } })

            if (!user) {
                return res.status(404).json({ error: "User not found" })
            }

            // Find riff
            const riff = await Riff.findByPk(id)

            if (!riff) {
                return res.status(404).json({ error: "Riff not found" })
            }

            // Remove from favorites
            const deleted = await Favorite.destroy({
                where: {
                    userId: user.id,
                    riffId: riff.id,
                },
            })

            if (deleted === 0) {
                return res.status(404).json({ error: "Favorite not found" })
            }

            logger.info(`Removed riff ${id} from favorites for user: ${walletAddress}`)

            return res.status(200).json({
                message: "Removed from favorites",
            })
        } catch (error) {
            logger.error("Error in removeFromFavorites:", error)
            return res.status(500).json({ error: "Internal server error" })
        }
    },

    // Check if a riff is in user's favorites
    checkFavorite: async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            const { id, walletAddress } = req.params

            // Find user
            const user = await User.findOne({ where: { walletAddress } })

            if (!user) {
                return res.status(404).json({ error: "User not found" })
            }

            // Find riff
            const riff = await Riff.findByPk(id)

            if (!riff) {
                return res.status(404).json({ error: "Riff not found" })
            }

            // Check if favorited
            const favorite = await Favorite.findOne({
                where: {
                    userId: user.id,
                    riffId: riff.id,
                },
            })

            return res.status(200).json({
                isFavorite: !!favorite,
            })
        } catch (error) {
            logger.error("Error in checkFavorite:", error)
            return res.status(500).json({ error: "Internal server error" })
        }
    },
}

export default favoriteController
