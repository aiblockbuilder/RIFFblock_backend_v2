import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import db from "../models"
import logger from "../utils/logger"
import { resourceUsage } from "process"

const User = db.User
const Riff = db.Riff
const Collection = db.Collection
const Stake = db.Stake
const Tip = db.Tip
const Favorite = db.Favorite

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
        avatar: user.avatar ? user.avatar : null,
        coverImage: user.coverImage ? user.coverImage : null,
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

      // console.log(">>> response : ", response)

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

      // console.log(">>> nfts : ", nfts)

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

  // Get all user activities across the platform
  getAllActivity: async (req: Request, res: Response) => {
    console.log("API endpoint : getAllActivity")

    const { page = 0, limit = 20 } = req.query
    const startIdx = Number.parseInt(page as string) * Number.parseInt(limit as string)
    const endIdx = startIdx + Number.parseInt(limit as string)

    try {
      // 1. Tips (sent and received)
      const tips = await Tip.findAll({
        include: [
          { model: User, as: "users" },
          { model: User, as: "recipient" },
          { model: Riff, as: "riffs" },
        ],
        order: [["createdAt", "DESC"]],
      })

      // 2. Stakes
      const stakes = await Stake.findAll({
        include: [
          { model: User, as: "users" },
          { model: Riff, as: "riffs" },
        ],
        order: [["createdAt", "DESC"]],
      })

      // 3. Riff Uploads
      const riffs = await Riff.findAll({
        include: [{ model: User, as: "creator" }],
        order: [["createdAt", "DESC"]],
      })

      // 4. Favorites
      const favorites = await Favorite.findAll({
        include: [
          { model: User, as: "users" },
          { model: Riff, as: "riffs", include: [{ model: User, as: "creator" }] },
        ],
        order: [["createdAt", "DESC"]],
      })

      // Normalize activities
      const activity = [
        ...tips.map((tip: any) => ({
          type: "tip",
          riffName: tip.riffs?.title || null,
          riffImage: tip.riffs?.coverImage || null,
          amount: tip.amount,
          fromUser: tip.users ? { id: tip.users.id, name: tip.users.name, avatar: tip.users.avatar } : null,
          toUser: tip.recipient ? { id: tip.recipient.id, name: tip.recipient.name, avatar: tip.recipient.avatar } : null,
          timestamp: tip.createdAt,
          activityId: tip.id,
        })),
        ...stakes.map((stake: any) => ({
          type: "stake",
          riffName: stake.riffs?.title || null,
          riffImage: stake.riffs?.coverImage || null,
          amount: stake.amount,
          fromUser: stake.users ? { id: stake.users.id, name: stake.users.name, avatar: stake.users.avatar } : null,
          timestamp: stake.createdAt,
          activityId: stake.id,
        })),
        ...riffs.map((riff: any) => ({
          type: "upload",
          riffName: riff.title,
          riffImage: riff.coverImage,
          fromUser: riff.creator ? { id: riff.creator.id, name: riff.creator.name, avatar: riff.creator.avatar } : null,
          timestamp: riff.createdAt,
          activityId: riff.id,
        })),
        ...favorites.map((fav: any) => ({
          type: "favorite",
          riffName: fav.riffs?.title || null,
          riffImage: fav.riffs?.coverImage || null,
          fromUser: fav.users ? { id: fav.users.id, name: fav.users.name, avatar: fav.users.avatar } : null,
          toUser: fav.riffs?.creator ? { id: fav.riffs.creator.id, name: fav.riffs.creator.name, avatar: fav.riffs.creator.avatar } : null,
          timestamp: fav.createdAt,
          activityId: `${fav.users?.id || ''}-${fav.createdAt.getTime()}`,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      return res.status(200).json(activity.slice(startIdx, endIdx))
    } catch (error) {
      logger.error("Error in getAllActivity:", error)
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

      // Normalize and sort activity
      const activity = [
        ...tips.map((tip: any) => ({
          type: "tip",
          riffName: tip.riff?.title || null,
          riffImage: tip.riff?.coverImage || null,
          amount: tip.amount,
          fromUser: tip.user ? { id: tip.user.id, name: tip.user.name, avatar: tip.user.avatar } : null,
          toUser: tip.recipient ? { id: tip.recipient.id, name: tip.recipient.name, avatar: tip.recipient.avatar } : null,
          timestamp: tip.createdAt,
          activityId: tip.id,
        })),
        ...stakes.map((stake: any) => ({
          type: "stake",
          riffName: stake.riff?.title || null,
          riffImage: stake.riff?.coverImage || null,
          amount: stake.amount,
          fromUser: user ? { id: user.id, name: user.name, avatar: user.avatar } : null,
          timestamp: stake.createdAt,
          activityId: stake.id,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

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
      const TippingTier = db.TippingTier

      // Find user
      const user = await User.findOne({ where: { walletAddress } })
      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Try to get user-specific tiers
      let tiers = await TippingTier.findAll({ where: { userId: user.id }, order: [["amount", "ASC"]] })
      // Fallback to global tiers if none found
      if (!tiers || tiers.length === 0) {
        tiers = await TippingTier.findAll({ where: { userId: null }, order: [["amount", "ASC"]] })
      }
      return res.status(200).json(tiers)
    } catch (error) {
      logger.error("Error in getUserTippingTiers:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Create a tipping tier
  createTippingTier: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const { walletAddress } = req.body
      const { name, amount, description, perks } = req.body
      const TippingTier = db.TippingTier
      // Find user
      const user = await User.findOne({ where: { walletAddress } })
      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }
      const newTier = await TippingTier.create({ userId: user.id, name, amount, description, perks })
      return res.status(201).json({ message: "Tipping tier created successfully", tier: newTier })
    } catch (error) {
      logger.error("Error in createTippingTier:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Update a tipping tier
  updateTippingTier: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const { id } = req.params
      const { name, amount, description, perks } = req.body
      const TippingTier = db.TippingTier
      const tier = await TippingTier.findByPk(id)
      if (!tier) {
        return res.status(404).json({ error: "Tipping tier not found" })
      }
      await tier.update({ name, amount, description, perks })
      return res.status(200).json({ message: "Tipping tier updated successfully", tier })
    } catch (error) {
      logger.error("Error in updateTippingTier:", error)
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
      const StakingSetting = db.StakingSetting
      // Find user
      const user = await User.findOne({ where: { walletAddress } })
      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }
      // Try to get user-specific settings
      let settings = await StakingSetting.findOne({ where: { userId: user.id } })
      // Fallback to global settings if not found
      if (!settings) {
        settings = await StakingSetting.findOne({ where: { userId: null } })
      }
      return res.status(200).json(settings)
    } catch (error) {
      logger.error("Error in getUserStakingSettings:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Create staking settings
  createStakingSettings: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const { walletAddress } = req.body
      const { defaultStakingEnabled, defaultRoyaltyShare, lockPeriodDays, minimumStakeAmount } = req.body
      const StakingSetting = db.StakingSetting
      // Find user
      const user = await User.findOne({ where: { walletAddress } })
      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }
      const newSettings = await StakingSetting.create({ userId: user.id, defaultStakingEnabled, defaultRoyaltyShare, lockPeriodDays, minimumStakeAmount })
      return res.status(201).json({ message: "Staking settings created successfully", settings: newSettings })
    } catch (error) {
      logger.error("Error in createStakingSettings:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Update user's staking settings
  updateUserStakingSettings: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const { walletAddress } = req.params
      const { defaultStakingEnabled, defaultRoyaltyShare, lockPeriodDays, minimumStakeAmount } = req.body
      const StakingSetting = db.StakingSetting
      // Find user
      const user = await User.findOne({ where: { walletAddress } })
      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }
      // Find user's staking settings
      const settings = await StakingSetting.findOne({ where: { userId: user.id } })
      if (!settings) {
        return res.status(404).json({ error: "Staking settings not found" })
      }
      await settings.update({ defaultStakingEnabled, defaultRoyaltyShare, lockPeriodDays, minimumStakeAmount })
      return res.status(200).json({ message: "Staking settings updated successfully", settings })
    } catch (error) {
      logger.error("Error in updateUserStakingSettings:", error)
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
      const { limit, page } = req.query
      const offset = (Number.parseInt(limit as string) * Number.parseInt(page as string))

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      console.log(">>> user id : ", user.id)

      // Get user's favorites with pagination
      const favorites = await Favorite.findAll({
        limit: Number.parseInt(limit as string),
        offset: offset,
        where: { userId: user.id },

        include: [
          {
            model: Riff,
            as: "riffs",
            include: [
              {
                model: User,
                as: "creator",
                attributes: ["id", "name"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      })

      // Extract only the Riff data
      const favoritedRiffs = favorites.map((fav: any) => fav.riffs)

      // console.log(">>> get user favorites : \n", favorites)

      return res.status(200).json(favoritedRiffs)
    } catch (error) {
      logger.error("Error in getUserFavorites:", error)
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

  // Get the most tipped user profile
  getMostTippedUserProfile: async (req: Request, res: Response) => {
    console.log(">>> getMostTippedUserProfile API")
    try {
      const Tip = db.Tip;
      const User = db.User;
      const Riff = db.Riff;
      const Stake = db.Stake;
      // Aggregate tips by recipientId
      const [result] = await Tip.findAll({
        attributes: [
          'recipientId',
          [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'totalTips']
        ],
        group: ['recipientId'],
        order: [[db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'DESC']],
        limit: 1,
        raw: true
      });
      let user;
      if (!result || !result.recipientId) {
        // No tips found, return first (random) user
        user = await User.findOne();
        if (!user) {
          return res.status(404).json({ error: 'No users found' });
        }
      } else {
        // Get user profile
        user = await User.findByPk(result.recipientId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
      }
      // Find the user's most staked riff
      const topRiffStake = await Stake.findOne({
        where: { userId: user.id },
        include: [{ model: Riff, as: 'riffs' }],
        order: [[db.Sequelize.col('amount'), 'DESC']],
      });
      let topRiff = 'Latest Upload';
      if (topRiffStake && topRiffStake.riffs && topRiffStake.riffs.title) {
        topRiff = topRiffStake.riffs.title;
      }
      // Get total tips
      const totalTips = (await Tip.sum('amount', { where: { recipientId: user.id } })) || 0;
      // Return expected frontend structure
      return res.status(200).json({
        name: user.name || user.walletAddress,
        image: user.avatar || '/placeholder.svg',
        riffTips: totalTips,
        topRiff,
      });
    } catch (error) {
      logger.error('Error in getMostTippedUserProfile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get user's riffs
  getUserRiffs: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { walletAddress } = req.params
      const { page = 0, limit = 10 } = req.query
      const offset = Number.parseInt(page as string) * Number.parseInt(limit as string)

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Get user's riffs with pagination
      const riffs = await Riff.findAll({
        where: { creatorId: user.id },
        order: [["createdAt", "DESC"]],
        limit: Number.parseInt(limit as string),
        offset: offset,
        include: [
          {
            model: Collection,
            as: "collection",
            attributes: ["id", "name"],
          },
        ],
      })

      return res.status(200).json(riffs)
    } catch (error) {
      logger.error("Error in getUserRiffs:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },
}

export default userController
