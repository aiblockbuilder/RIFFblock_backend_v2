import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import db from "../models"
import logger from "../utils/logger"

const User = db.User
const Riff = db.Riff
const Stake = db.Stake

const stakeController = {
  // Get user's staked riffs
  getUserStakedRiffs: async (req: Request, res: Response) => {
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

      // Get all active stakes for this user with riff information
      const stakes = await Stake.findAll({
        where: { userId: user.id, isActive: true },
        include: [
          {
            model: Riff,
            as: "riffs",
            include: [
              {
                model: User,
                as: "creator",
                attributes: ["id", "name", "walletAddress"],
              },
            ],
          },
        ],
        order: [["stakedAt", "DESC"]],
      })

      // Transform the data to match the expected frontend format
      const stakedRiffs = stakes.map((stake: any) => {
        const riff = stake.riffs
        const creator = riff.creator
        
        // Determine status based on unlock date
        const now = new Date()
        const isUnlocked = now >= stake.unlockAt || stake.isUnlocked
        const status = isUnlocked ? "unlocked" : "locked"

        return {
          id: stake.id,
          riffId: riff.id,
          tokenId: riff.tokenId, // Add token ID for smart contract calls
          title: riff.title,
          artist: creator.name || `user_${creator.walletAddress.substring(2, 8)}`,
          image: riff.coverImage || "/placeholder.svg",
          stakedAmount: parseFloat(stake.amount.toString()),
          stakedDate: stake.stakedAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
          unlockDate: stake.unlockAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
          royaltiesEarned: parseFloat(stake.royaltiesEarned.toString()),
          status,
        }
      })

      return res.status(200).json(stakedRiffs)
    } catch (error) {
      logger.error("Error in getUserStakedRiffs:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get NFT staking info
  getNftStakingInfo: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { nftId } = req.params

      // Find riff
      const riff = await Riff.findByPk(nftId)

      if (!riff) {
        return res.status(404).json({ error: "Riff not found" })
      }

      // Get staking info
      const totalStakes = await Stake.count({ where: { riffId: riff.id } })
      const totalStakeAmount = (await Stake.sum("amount", { where: { riffId: riff.id } })) || 0

      // Get top stakers
      const topStakers = await Stake.findAll({
        where: { riffId: riff.id },
        include: [{ model: User, as: "user", attributes: ["id", "name", "walletAddress", "avatar"] }],
        order: [["amount", "DESC"]],
        limit: 5,
      })

      return res.status(200).json({
        riffId: riff.id,
        isStakable: riff.isStakable,
        stakingRoyaltyShare: riff.stakingRoyaltyShare,
        totalStakes,
        totalStakeAmount,
        topStakers,
      })
    } catch (error) {
      logger.error("Error in getNftStakingInfo:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Stake on an NFT
  stakeOnNft: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { nftId, walletAddress } = req.params
      const { amount } = req.body

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Find riff
      const riff = await Riff.findByPk(nftId)

      if (!riff) {
        return res.status(404).json({ error: "Riff not found" })
      }

      // Check if riff is stakable
      if (!riff.isStakable) {
        return res.status(400).json({ error: "Riff is not stakable" })
      }

      // Check if user is trying to stake on their own riff
      if (riff.creatorId === user.id) {
        return res.status(400).json({ error: "Cannot stake on your own riff" })
      }

      // Check if user already has a stake
      const existingStake = await Stake.findOne({
        where: {
          riffId: riff.id,
          userId: user.id,
        },
      })

      if (existingStake) {
        return res.status(400).json({ error: "User already has a stake on this riff" })
      }

      // Calculate unlock date (90 days from now)
      const unlockAt = new Date()
      unlockAt.setDate(unlockAt.getDate() + 90)

      // Create stake
      const stake = await Stake.create({
        userId: user.id,
        riffId: riff.id,
        amount,
        stakedAt: new Date(),
        unlockAt,
        isUnlocked: false,
        royaltiesEarned: 0,
        isActive: true,
      })

      logger.info(`Created stake of ${amount} RIFF on riff: ${nftId} by user: ${walletAddress}`)

      return res.status(201).json({
        message: "Stake created successfully",
        stake,
      })
    } catch (error) {
      logger.error("Error in stakeOnNft:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Unstake from an NFT
  unstakeFromNft: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { nftId, walletAddress } = req.params

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Find stake
      const stake = await Stake.findOne({
        where: {
          riffId: nftId,
          userId: user.id,
        },
      })

      if (!stake) {
        return res.status(404).json({ error: "Stake not found" })
      }

      // Check if stake is unlocked
      if (!stake.isUnlocked) {
        const now = new Date()
        if (now < stake.unlockAt) {
          return res.status(400).json({
            error: "Stake is still locked",
            unlockAt: stake.unlockAt,
          })
        }

        // Update stake to unlocked
        await stake.update({ isUnlocked: true })
      }

      // Get royalties earned
      const royaltiesEarned = stake.royaltiesEarned

      // Mark stake as inactive instead of deleting
      await stake.update({ isActive: false })

      logger.info(`Unstaked from riff: ${nftId} by user: ${walletAddress}`)

      return res.status(200).json({
        message: "Unstaked successfully",
        amount: stake.amount,
        royaltiesEarned,
      })
    } catch (error) {
      logger.error("Error in unstakeFromNft:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Claim royalties for user's staked riffs
  claimRoyalties: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { walletAddress } = req.params
      const { claimedAmounts } = req.body

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      let totalClaimed = 0
      const updatedStakes = []

      // Update each stake's royaltiesEarned field
      for (const claim of claimedAmounts) {
        const stake = await Stake.findOne({
          where: {
            id: claim.stakeId,
            userId: user.id,
          },
        })

        if (!stake) {
          return res.status(404).json({ error: `Stake with ID ${claim.stakeId} not found` })
        }

        // Update the royaltiesEarned field (subtract the claimed amount)
        const newRoyaltiesEarned = Math.max(0, parseFloat(stake.royaltiesEarned.toString()) - claim.amount)
        await stake.update({ royaltiesEarned: newRoyaltiesEarned })

        totalClaimed += claim.amount
        updatedStakes.push({
          stakeId: stake.id,
          previousAmount: parseFloat(stake.royaltiesEarned.toString()),
          claimedAmount: claim.amount,
          newAmount: newRoyaltiesEarned,
        })
      }

      logger.info(`Claimed ${totalClaimed} RIFF royalties for user: ${walletAddress}`)

      return res.status(200).json({
        message: "Royalties claimed successfully",
        totalClaimed,
        updatedStakes,
      })
    } catch (error) {
      logger.error("Error in claimRoyalties:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Unstake from a specific stake (by stake ID)
  unstakeFromStake: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { stakeId, walletAddress } = req.params

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Find stake
      const stake = await Stake.findOne({
        where: {
          id: stakeId,
          userId: user.id,
        },
        include: [{ model: Riff, as: "riffs" }],
      })

      if (!stake) {
        return res.status(404).json({ error: "Stake not found" })
      }

      // Check if stake is unlocked
      if (!stake.isUnlocked) {
        const now = new Date()
        if (now < stake.unlockAt) {
          return res.status(400).json({
            error: "Stake is still locked",
            unlockAt: stake.unlockAt,
          })
        }

        // Update stake to unlocked
        await stake.update({ isUnlocked: true })
      }

      // Get stake details before marking as inactive
      const stakeAmount = parseFloat(stake.amount.toString())
      const royaltiesEarned = parseFloat(stake.royaltiesEarned.toString())
      const riffTitle = stake.riffs?.title || "Unknown Riff"

      // Mark stake as inactive instead of deleting
      await stake.update({ isActive: false })

      logger.info(`Unstaked from riff: ${riffTitle} (ID: ${stake.riffs?.id}) by user: ${walletAddress}`)

      return res.status(200).json({
        message: "Unstaked successfully",
        stakeAmount,
        royaltiesEarned,
        riffTitle,
      })
    } catch (error) {
      logger.error("Error in unstakeFromStake:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get total royalties earned from all stakes (active and inactive)
  getTotalRoyaltiesEarned: async (req: Request, res: Response) => {
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

      // Get total royalties from all stakes (active and inactive)
      const totalRoyalties = await Stake.sum("royaltiesEarned", {
        where: { userId: user.id },
      }) || 0

      return res.status(200).json({
        totalRoyaltiesEarned: parseFloat(totalRoyalties.toString()),
      })
    } catch (error) {
      logger.error("Error in getTotalRoyaltiesEarned:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },
}

export default stakeController
