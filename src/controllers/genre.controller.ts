import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import db from "../models"
import logger from "../utils/logger"

const Genre = db.Genre

const genreController = {
  // Get all genres
  getAllGenres: async (req: Request, res: Response) => {
    try {
      const genres = await Genre.findAll({
        order: [["name", "ASC"]],
      })

      return res.status(200).json(genres)
    } catch (error) {
      logger.error("Error in getAllGenres:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Get genre by ID
  getGenreById: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params

      const genre = await Genre.findByPk(id)

      if (!genre) {
        return res.status(404).json({ error: "Genre not found" })
      }

      return res.status(200).json(genre)
    } catch (error) {
      logger.error("Error in getGenreById:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },

  // Create new genre
  createGenre: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name } = req.body

      // Check if genre already exists
      const existingGenre = await Genre.findOne({ where: { name } })

      if (existingGenre) {
        return res.status(400).json({ error: "Genre already exists" })
      }

      // Create genre
      const genre = await Genre.create({ name })

      logger.info(`Created new genre: ${name}`)

      return res.status(201).json({
        message: "Genre created successfully",
        genre,
      })
    } catch (error) {
      logger.error("Error in createGenre:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },
}

export default genreController
