import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import db from "../models"
import logger from "../utils/logger"

const User = db.User
const Collection = db.Collection
const Riff = db.Riff

const collectionController = {
  // Get all collections
  getAllCollections: async (req: Request, res: Response) => {
    try {
      const collections = await Collection.findAll({
        include: [{ model: User, as: "creator", attributes: ["id", "name", "walletAddress", "avatar"] }],
        order: [["createdAt", "DESC"]],
      })

      return res.status(200).json(collections)
    } catch (error) {
      logger.error("Error in getAllCollections:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get collection by ID
  getCollectionById: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params

      const collection = await Collection.findByPk(id, {
        include: [{ model: User, as: "creator", attributes: ["id", "name", "walletAddress", "avatar"] }],
      })

      if (!collection) {
        return res.status(404).json({ error: "Collection not found" })
      }

      return res.status(200).json(collection)
    } catch (error) {
      logger.error("Error in getCollectionById:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Create new collection
  createCollection: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, description, walletAddress } = req.body

      // Find user
      const user = await User.findOne({ where: { walletAddress } })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Create collection
      const collection = await Collection.create({
        name,
        description: description || "",
        creatorId: user.id,
      })

      logger.info(`Created new collection: ${name} by user: ${walletAddress}`)

      return res.status(201).json({
        message: "Collection created successfully",
        collection,
      })
    } catch (error) {
      logger.error("Error in createCollection:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Upload collection cover image
  uploadCover: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" })
      }

      const { id } = req.params

      // Find collection
      const collection = await Collection.findByPk(id)

      if (!collection) {
        return res.status(404).json({ error: "Collection not found" })
      }

      // Update collection
      await collection.update({ coverImage: req.file.filename })

      logger.info(`Updated cover image for collection: ${collection.name}`)

      return res.status(200).json({
        message: "Cover image uploaded successfully",
        coverImage: `/uploads/images/${req.file.filename}`,
      })
    } catch (error) {
      logger.error("Error in uploadCover:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get NFTs in a collection
  getCollectionNfts: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params

      // Find collection
      const collection = await Collection.findByPk(id)

      if (!collection) {
        return res.status(404).json({ error: "Collection not found" })
      }

      // Get riffs in collection
      const riffs = await Riff.findAll({
        where: { collectionId: collection.id },
        include: [{ model: User, as: "creator", attributes: ["id", "name", "walletAddress", "avatar"] }],
        order: [["createdAt", "DESC"]],
      })

      return res.status(200).json(riffs)
    } catch (error) {
      logger.error("Error in getCollectionNfts:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },
}

export default collectionController
