import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import db from "../models"
import logger from "../utils/logger"
import type { Express } from "express"

const User = db.User
const Riff = db.Riff
const Collection = db.Collection
const Stake = db.Stake
const Tip = db.Tip
const Tag = db.Tag
const RiffTag = db.RiffTag

const riffController = {
  // Get all riffs with filtering
  getAllRiffs: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const {
        genre,
        mood,
        instrument,
        priceMin,
        priceMax,
        stakable,
        backstage,
        unlockable,
        sortBy,
        limit = 20,
        offset = 0,
      } = req.query

      // Build filter
      const filter: any = {}

      if (genre) filter.genre = genre
      if (mood) filter.mood = mood
      if (instrument) filter.instrument = instrument
      if (stakable === "true") filter.isStakable = true
      if (backstage === "true") filter.unlockBackstageContent = true
      if (unlockable === "true") {
        filter[db.Sequelize.Op.or] = [
          { unlockSourceFiles: true },
          { unlockRemixRights: true },
          { unlockPrivateMessages: true },
          { unlockBackstageContent: true },
        ]
      }

      if (priceMin || priceMax) {
        filter.price = {}
        if (priceMin) filter.price[db.Sequelize.Op.gte] = priceMin
        if (priceMax) filter.price[db.Sequelize.Op.lte] = priceMax
      }

      // Build sort
      let order: any = [["createdAt", "DESC"]]

      if (sortBy === "price-asc") order = [["price", "ASC"]]
      if (sortBy === "price-desc") order = [["price", "DESC"]]
      if (sortBy === "title-asc") order = [["title", "ASC"]]
      if (sortBy === "title-desc") order = [["title", "DESC"]]

      // Get riffs
      const riffs = await Riff.findAndCountAll({
        where: filter,
        include: [
          { model: User, as: "creator", attributes: ["id", "name", "walletAddress", "avatar"] },
          { model: Collection, as: "collection", attributes: ["id", "name"] },
        ],
        order,
        limit: Number.parseInt(limit as string),
        offset: Number.parseInt(offset as string),
      })

      return res.status(200).json({
        total: riffs.count,
        riffs: riffs.rows,
        limit: Number.parseInt(limit as string),
        offset: Number.parseInt(offset as string),
      })
    } catch (error) {
      logger.error("Error in getAllRiffs:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get riff by ID
  getRiffById: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params

      // Get riff
      const riff = await Riff.findByPk(id, {
        include: [
          { model: User, as: "creator", attributes: ["id", "name", "walletAddress", "avatar"] },
          { model: Collection, as: "collection", attributes: ["id", "name"] },
        ],
      })

      if (!riff) {
        return res.status(404).json({ error: "Riff not found" })
      }

      // Get stats
      const totalStakes = await Stake.count({ where: { riffId: riff.id } })
      const totalStakeAmount = (await Stake.sum("amount", { where: { riffId: riff.id } })) || 0
      const totalTips = (await Tip.sum("amount", { where: { riffId: riff.id } })) || 0

      // Format response
      const response = {
        ...riff.toJSON(),
        stats: {
          totalStakes,
          totalStakeAmount,
          totalTips,
        },
      }

      return res.status(200).json(response)
    } catch (error) {
      logger.error("Error in getRiffById:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get riff activity
  getRiffActivity: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params

      // Get riff
      const riff = await Riff.findByPk(id)

      if (!riff) {
        return res.status(404).json({ error: "Riff not found" })
      }

      // Get activity
      const tips = await Tip.findAll({
        where: { riffId: riff.id },
        include: [
          { model: User, as: "user", attributes: ["id", "name", "walletAddress", "avatar"] },
          { model: User, as: "recipient", attributes: ["id", "name", "walletAddress", "avatar"] },
        ],
        order: [["createdAt", "DESC"]],
        limit: 20,
      })

      const stakes = await Stake.findAll({
        where: { riffId: riff.id },
        include: [{ model: User, as: "user", attributes: ["id", "name", "walletAddress", "avatar"] }],
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
      logger.error("Error in getRiffActivity:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Upload a new riff
  uploadRiff: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] }

      if (!files.audio || !files.audio[0]) {
        return res.status(400).json({ error: "Audio file is required" })
      }

      const audioFile = files.audio[0]
      const coverImage = files.cover ? files.cover[0] : null

      const {
        title,
        description,
        genre,
        mood,
        instrument,
        keySignature,
        timeSignature,
        isBargainBin,
        collectionId,
        newCollectionName,
        price,
        currency,
        royaltyPercentage,
        isStakable,
        stakingRoyaltyShare,
        unlockSourceFiles,
        unlockRemixRights,
        unlockPrivateMessages,
        unlockBackstageContent,
        walletAddress,
      } = req.body

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Handle collection
      let riffCollectionId = collectionId

      if (!collectionId && newCollectionName) {
        // Create new collection
        const newCollection = await Collection.create({
          name: newCollectionName,
          description: "",
          creatorId: user.id,
        })

        riffCollectionId = newCollection.id
      }

      // Create riff
      const riff = await Riff.create({
        title,
        description: description || "",
        audioFile: audioFile.filename,
        coverImage: coverImage ? coverImage.filename : null,
        duration: 0, // To be updated later
        genre: genre || null,
        mood: mood || null,
        instrument: instrument || null,
        keySignature: keySignature || null,
        timeSignature: timeSignature || null,
        isBargainBin: isBargainBin === "true",
        price: price || null,
        currency: currency || "RIFF",
        royaltyPercentage: royaltyPercentage || 10,
        isStakable: isStakable === "true",
        stakingRoyaltyShare: stakingRoyaltyShare || 50,
        isNft: false, // Not minted yet
        unlockSourceFiles: unlockSourceFiles === "true",
        unlockRemixRights: unlockRemixRights === "true",
        unlockPrivateMessages: unlockPrivateMessages === "true",
        unlockBackstageContent: unlockBackstageContent === "true",
        creatorId: user.id,
        collectionId: riffCollectionId || null,
      })

      logger.info(`Created new riff: ${title} by user: ${walletAddress}`)

      return res.status(201).json({
        message: "Riff uploaded successfully",
        riff,
      })
    } catch (error) {
      logger.error("Error in uploadRiff:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Mint a riff as NFT
  mintRiff: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const { walletAddress } = req.body

      // Get riff
      const riff = await Riff.findByPk(id, {
        include: [{ model: User, as: "creator" }],
      })

      if (!riff) {
        return res.status(404).json({ error: "Riff not found" })
      }

      // Check if user is the creator
      if (riff.creator.walletAddress !== walletAddress) {
        return res.status(403).json({ error: "Only the creator can mint this riff" })
      }

      // Check if already minted
      if (riff.isNft) {
        return res.status(400).json({ error: "Riff is already minted" })
      }

      // Mock minting process
      // In a real implementation, this would interact with the blockchain
      const tokenId = Math.floor(Math.random() * 1000000).toString()
      const contractAddress = process.env.CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890"

      // Update riff
      await riff.update({
        isNft: true,
        tokenId,
        contractAddress,
      })

      logger.info(`Minted riff: ${riff.title} with tokenId: ${tokenId}`)

      return res.status(200).json({
        message: "Riff minted successfully",
        tokenId,
        contractAddress,
      })
    } catch (error) {
      logger.error("Error in mintRiff:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get staking rewards
  getStakingRewards: async (req: Request, res: Response) => {
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

      // Get stake
      const stake = await Stake.findOne({
        where: {
          riffId: id,
          userId: user.id,
        },
        include: [{ model: Riff, as: "riff" }],
      })

      if (!stake) {
        return res.status(404).json({ error: "Stake not found" })
      }

      return res.status(200).json({
        stake,
        rewards: stake.royaltiesEarned,
      })
    } catch (error) {
      logger.error("Error in getStakingRewards:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Claim rewards
  claimRewards: async (req: Request, res: Response) => {
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

      // Get stake
      const stake = await Stake.findOne({
        where: {
          riffId: id,
          userId: user.id,
        },
      })

      if (!stake) {
        return res.status(404).json({ error: "Stake not found" })
      }

      // Check if there are rewards to claim
      if (stake.royaltiesEarned <= 0) {
        return res.status(400).json({ error: "No rewards to claim" })
      }

      // Mock claiming process
      // In a real implementation, this would interact with the blockchain
      const claimedAmount = stake.royaltiesEarned

      // Reset rewards
      await stake.update({ royaltiesEarned: 0 })

      logger.info(`Claimed ${claimedAmount} RIFF rewards for user: ${walletAddress}`)

      return res.status(200).json({
        message: "Rewards claimed successfully",
        amount: claimedAmount,
      })
    } catch (error) {
      logger.error("Error in claimRewards:", error)
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

      // Add to favorites
      await user.addFavoritedRiff(riff)

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
      await user.removeFavoritedRiff(riff)

      logger.info(`Removed riff ${id} from favorites for user: ${walletAddress}`)

      return res.status(200).json({
        message: "Removed from favorites",
      })
    } catch (error) {
      logger.error("Error in removeFromFavorites:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },
}

export default riffController
