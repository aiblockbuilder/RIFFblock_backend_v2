import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import db from "../models"
import logger from "../utils/logger"

const User = db.User
const Riff = db.Riff

// Mock marketplace listings
const listings = []
const sales = []

const marketController = {
  // Get all listings
  getAllListings: async (req: Request, res: Response) => {
    try {
      // Mock response for now
      return res.status(200).json({
        listings: [
          {
            id: 1,
            riffId: 1,
            seller: {
              id: 1,
              name: "SYNTHWAVE_92",
              walletAddress: "0x1234567890123456789012345678901234567890",
            },
            price: 100,
            currency: "RIFF",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 2,
            riffId: 2,
            seller: {
              id: 2,
              name: "RetroWave",
              walletAddress: "0x0987654321098765432109876543210987654321",
            },
            price: 250,
            currency: "RIFF",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      })
    } catch (error) {
      logger.error("Error in getAllListings:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get listing by ID
  getListingById: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params

      // Mock response for now
      return res.status(200).json({
        id: Number.parseInt(id),
        riffId: 1,
        seller: {
          id: 1,
          name: "SYNTHWAVE_92",
          walletAddress: "0x1234567890123456789012345678901234567890",
        },
        price: 100,
        currency: "RIFF",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } catch (error) {
      logger.error("Error in getListingById:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get sales history by ID
  getSalesHistory: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params

      // Mock response for now
      return res.status(200).json({
        sales: [
          {
            id: 1,
            riffId: Number.parseInt(id),
            seller: {
              id: 1,
              name: "SYNTHWAVE_92",
              walletAddress: "0x1234567890123456789012345678901234567890",
            },
            buyer: {
              id: 3,
              name: "CyberSoul",
              walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
            },
            price: 100,
            currency: "RIFF",
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          },
        ],
      })
    } catch (error) {
      logger.error("Error in getSalesHistory:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Update listing
  updateListing: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const { price, currency, isActive } = req.body

      // Mock response for now
      return res.status(200).json({
        message: "Listing updated successfully",
        listing: {
          id: Number.parseInt(id),
          riffId: 1,
          seller: {
            id: 1,
            name: "SYNTHWAVE_92",
            walletAddress: "0x1234567890123456789012345678901234567890",
          },
          price: price || 100,
          currency: currency || "RIFF",
          isActive: isActive !== undefined ? isActive : true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    } catch (error) {
      logger.error("Error in updateListing:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Create new listing
  createListing: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { riffId, sellerWalletAddress, price, currency } = req.body

      // Find user
      const user = await User.findOne({ where: { walletAddress: sellerWalletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Find riff
      const riff = await Riff.findByPk(riffId)

      if (!riff) {
        return res.status(404).json({ error: "Riff not found" })
      }

      // Check if user is the creator
      if (riff.creatorId !== user.id) {
        return res.status(403).json({ error: "Only the creator can list this riff" })
      }

      // Check if riff is an NFT
      if (!riff.isNft) {
        return res.status(400).json({ error: "Riff must be minted as an NFT before listing" })
      }

      // Mock creating a listing
      const newListing = {
        id: Math.floor(Math.random() * 1000),
        riffId,
        seller: {
          id: user.id,
          name: user.name,
          walletAddress: user.walletAddress,
        },
        price,
        currency: currency || "RIFF",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      listings.push(newListing)

      logger.info(`Created new listing for riff: ${riffId} by user: ${sellerWalletAddress}`)

      return res.status(201).json({
        message: "Listing created successfully",
        listing: newListing,
      })
    } catch (error) {
      logger.error("Error in createListing:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Buy a riff
  buyRiff: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { listingId, buyerWalletAddress } = req.body

      // Find user
      const buyer = await User.findOne({ where: { walletAddress: buyerWalletAddress } })

      if (!buyer) {
        return res.status(404).json({ error: "Buyer not found" })
      }

      // Mock finding a listing
      const listing = listings.find((l) => l.id === Number.parseInt(listingId))

      if (!listing) {
        return res.status(404).json({ error: "Listing not found" })
      }

      // Mock purchase
      const sale = {
        id: Math.floor(Math.random() * 1000),
        listingId,
        riffId: listing.riffId,
        seller: listing.seller,
        buyer: {
          id: buyer.id,
          name: buyer.name,
          walletAddress: buyer.walletAddress,
        },
        price: listing.price,
        currency: listing.currency,
        createdAt: new Date(),
      }

      sales.push(sale)

      // Remove listing
      const listingIndex = listings.findIndex((l) => l.id === Number.parseInt(listingId))
      if (listingIndex !== -1) {
        listings.splice(listingIndex, 1)
      }

      logger.info(`Riff purchased: ${listing.riffId} by user: ${buyerWalletAddress}`)

      return res.status(200).json({
        message: "Riff purchased successfully",
        sale,
      })
    } catch (error) {
      logger.error("Error in buyRiff:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },
}

export default marketController
