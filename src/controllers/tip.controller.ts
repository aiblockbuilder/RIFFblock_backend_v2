import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import db from "../models"
import logger from "../utils/logger"

const User = db.User
const Riff = db.Riff
const Tip = db.Tip

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

      // Mock creating a tipping tier
      const newTier = {
        id: Math.floor(Math.random() * 1000),
        name,
        amount,
        description: description || "",
        perks: perks || [],
        creatorId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

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
}

export default tipController
