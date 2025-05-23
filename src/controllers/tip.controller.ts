import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import db from "../models"
import logger from "../utils/logger"

const User = db.User
const Riff = db.Riff
const Tip = db.Tip
const TippingTier = db.TippingTier

const tipController = {
  // Send a tip
  sendTip: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { senderWalletAddress, recipientWalletAddress, riffId, amount, currency, message, tierId } = req.body

      // Find sender
      const sender = await User.findOne({ where: { walletAddress: senderWalletAddress } })

      if (!sender) {
        return res.status(404).json({ error: "Sender not found" })
      }

      // Find recipient
      const recipient = await User.findOne({ where: { walletAddress: recipientWalletAddress } })

      if (!recipient) {
        return res.status(404).json({ error: "Recipient not found" })
      }

      // Check if riff exists if provided
      let riff = null
      if (riffId) {
        riff = await Riff.findByPk(riffId)

        if (!riff) {
          return res.status(404).json({ error: "Riff not found" })
        }
      }

      // Create tip
      const tip = await Tip.create({
        userId: sender.id,
        recipientId: recipient.id,
        riffId: riff ? riff.id : null,
        amount,
        currency: currency || "RIFF",
        message: message || "",
        tierId: tierId || null,
      })

      logger.info(
        `Sent tip of ${amount} ${currency || "RIFF"} from ${senderWalletAddress} to ${recipientWalletAddress}`,
      )

      return res.status(201).json({
        message: "Tip sent successfully",
        tip,
      })
    } catch (error) {
      logger.error("Error in sendTip:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get tipping tiers for an artist
  getTippingTiers: async (req: Request, res: Response) => {
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

      // Try to get user-specific tiers
      let tiers = await TippingTier.findAll({ where: { userId: user.id }, order: [["amount", "ASC"]] })
      // Fallback to global tiers if none found
      if (!tiers || tiers.length === 0) {
        tiers = await TippingTier.findAll({ where: { userId: null }, order: [["amount", "ASC"]] })
      }
      return res.status(200).json(tiers)
    } catch (error) {
      logger.error("Error in getTippingTiers:", error)
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

      const { walletAddress, name, amount, description, perks } = req.body

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      const newTier = await TippingTier.create({ userId: user.id, name, amount, description, perks })

      logger.info(`Created new tipping tier: ${name} by user: ${walletAddress}`)

      return res.status(201).json({
        message: "Tipping tier created successfully",
        tier: newTier,
      })
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

  // Delete a tipping tier
  deleteTippingTier: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const { id } = req.params
      const tier = await TippingTier.findByPk(id)
      if (!tier) {
        return res.status(404).json({ error: "Tipping tier not found" })
      }
      await tier.destroy()
      return res.status(200).json({ message: "Tipping tier deleted successfully" })
    } catch (error) {
      logger.error("Error in deleteTippingTier:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },
}

export default tipController
