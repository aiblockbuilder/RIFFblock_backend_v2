import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import db from "../models"
import logger from "../utils/logger"

const User = db.User
const Riff = db.Riff
const Collection = db.Collection
const Stake = db.Stake
const Tip = db.Tip

const userController = {
  // Get user by wallet address
  getUserByWalletAddress: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { walletAddress } = req.params

      // Find or create user
      let user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        // Create a new user with default values
        user = await User.create({
          walletAddress,
          name: `User_${walletAddress.substring(0, 6)}`,
          bio: "Sample bio",
          location: "USA",
          avatar: "",
          coverImage: "",
          ensName: "sampleEnsName",
          twitterUrl: "https://x.com/",
          instagramUrl: "https://instagram.com/",
          websiteUrl: "https://example.com",
          genres: [],
          influences: [],
        })

        logger.info(`Created new user for wallet address: ${walletAddress}`)
      }

      // Get user stats
      const totalRiffs = await Riff.count({ where: { creatorId: user.id } })
      const totalTips = (await Tip.sum("amount", { where: { recipientId: user.id } })) || 0
      const totalStaked = (await Stake.sum("amount", { where: { userId: user.id } })) || 0

      // Format response
      const response = {
        id: user.id,
        walletAddress: user.walletAddress,
        name: user.name,
        bio: user.bio,
        location: user.location,
        avatar: user.avatar ? `/uploads/images/${user.avatar}` : null,
        coverImage: user.coverImage ? `/uploads/images/${user.coverImage}` : null,
        ensName: user.ensName,
        socialLinks: {
          twitter: user.twitterUrl,
          instagram: user.instagramUrl,
          website: user.websiteUrl,
        },
        genres: user.genres,
        influences: user.influences,
        stats: {
          totalRiffs,
          totalTips,
          totalStaked,
          followers: 0, // Placeholder for future implementation
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }

      console.log(">>> response : ", response)

      return res.status(200).json(response)
    } catch (error) {
      logger.error("Error in getUserByWalletAddress:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Update user
  updateUser: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { walletAddress } = req.params
      const updateData = req.body

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Update user
      await user.update(updateData)

      logger.info(`Updated user for wallet address: ${walletAddress}`)

      return res.status(200).json({ message: "User updated successfully", user })
    } catch (error) {
      logger.error("Error in updateUser:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get user's NFTs
  getUserNfts: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { walletAddress } = req.params

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Get user's NFTs
      const nfts = await Riff.findAll({
        where: {
          creatorId: user.id,
          isNft: true,
        },
        order: [["createdAt", "DESC"]],
      })

      return res.status(200).json(nfts)
    } catch (error) {
      logger.error("Error in getUserNfts:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get user's collections
  getUserCollections: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { walletAddress } = req.params

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Get user's collections
      const collections = await Collection.findAll({
        where: { creatorId: user.id },
        order: [["createdAt", "DESC"]],
      })

      return res.status(200).json(collections)
    } catch (error) {
      logger.error("Error in getUserCollections:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get user's activity
  getUserActivity: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { walletAddress } = req.params

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Get user's activity (tips, stakes, etc.)
      const tips = await Tip.findAll({
        where: {
          [db.Sequelize.Op.or]: [{ userId: user.id }, { recipientId: user.id }],
        },
        include: [
          { model: User, as: "user" },
          { model: User, as: "recipient" },
          { model: Riff, as: "riff" },
        ],
        order: [["createdAt", "DESC"]],
        limit: 20,
      })

      const stakes = await Stake.findAll({
        where: { userId: user.id },
        include: [{ model: Riff, as: "riff" }],
        order: [["createdAt", "DESC"]],
        limit: 20,
      })

      // Combine and sort activity
      const activity = [
        ...tips.map((tip) => ({
          type: "tip",
          data: tip,
          createdAt: tip.createdAt,
        })),
        ...stakes.map((stake) => ({
          type: "stake",
          data: stake,
          createdAt: stake.createdAt,
        })),
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      return res.status(200).json(activity)
    } catch (error) {
      logger.error("Error in getUserActivity:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get user's tipping tiers
  getUserTippingTiers: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { walletAddress } = req.params

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Mock tipping tiers for now
      const tippingTiers = [
        {
          id: 1,
          name: "Supporter",
          amount: 100,
          description: "Access to exclusive behind-the-scenes content and early previews of upcoming riffs.",
          perks: ["Exclusive updates", "Early access to new riffs"],
        },
        {
          id: 2,
          name: "Enthusiast",
          amount: 250,
          description: "All previous perks plus access to private livestreams and unreleased demo riffs.",
          perks: ["Private livestreams", "Unreleased demos", "Monthly Q&A"],
        },
        {
          id: 3,
          name: "Patron",
          amount: 500,
          description: "All previous perks plus personalized feedback on your own music and exclusive collaborations.",
          perks: ["Personalized feedback", "Exclusive collaborations", "Discord role"],
        },
      ]

      return res.status(200).json(tippingTiers)
    } catch (error) {
      logger.error("Error in getUserTippingTiers:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get user's favorites
  getUserFavorites: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { walletAddress } = req.params

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Get user's favorites
      const favorites = await user.getFavoritedRiffs()

      return res.status(200).json(favorites)
    } catch (error) {
      logger.error("Error in getUserFavorites:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get user's staking settings
  getUserStakingSettings: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { walletAddress } = req.params

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Mock staking settings for now
      const stakingSettings = {
        defaultStakingEnabled: true,
        defaultRoyaltyShare: 50,
        lockPeriodDays: 90,
        minimumStakeAmount: 100,
      }

      return res.status(200).json(stakingSettings)
    } catch (error) {
      logger.error("Error in getUserStakingSettings:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Upload avatar
  uploadAvatar: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" })
      }

      const { walletAddress } = req.body

      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" })
      }

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Update user's avatar
      await user.update({ avatar: req.file.filename })

      logger.info(`Updated avatar for user: ${walletAddress}`)

      return res.status(200).json({
        message: "Avatar uploaded successfully",
        avatar: `/uploads/images/${req.file.filename}`,
      })
    } catch (error) {
      logger.error("Error in uploadAvatar:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Upload cover image
  uploadCover: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" })
      }

      const { walletAddress } = req.body

      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" })
      }

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Update user's cover image
      await user.update({ coverImage: req.file.filename })

      logger.info(`Updated cover image for user: ${walletAddress}`)

      return res.status(200).json({
        message: "Cover image uploaded successfully",
        coverImage: `/uploads/images/${req.file.filename}`,
      })
    } catch (error) {
      logger.error("Error in uploadCover:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },
}

export default userController
