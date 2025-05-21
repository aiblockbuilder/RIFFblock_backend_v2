import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import db from "../models"
import logger from "../utils/logger"

const Tag = db.Tag

const tagController = {
  // Get all tags
  getAllTags: async (req: Request, res: Response) => {
    try {
      const tags = await Tag.findAll({
        order: [["name", "ASC"]],
      })

      return res.status(200).json(tags)
    } catch (error) {
      logger.error("Error in getAllTags:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get tag by ID
  getTagById: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params

      const tag = await Tag.findByPk(id)

      if (!tag) {
        return res.status(404).json({ error: "Tag not found" })
      }

      return res.status(200).json(tag)
    } catch (error) {
      logger.error("Error in getTagById:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Create new tag
  createTag: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name } = req.body

      // Check if tag already exists
      const existingTag = await Tag.findOne({ where: { name } })

      if (existingTag) {
        return res.status(400).json({ error: "Tag already exists" })
      }

      // Create tag
      const tag = await Tag.create({ name })

      logger.info(`Created new tag: ${name}`)

      return res.status(201).json({
        message: "Tag created successfully",
        tag,
      })
    } catch (error) {
      logger.error("Error in createTag:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },
}

export default tagController
