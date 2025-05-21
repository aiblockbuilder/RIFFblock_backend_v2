import express from "express"
import { body, param } from "express-validator"
import genreController from "../controllers/genre.controller"

const router = express.Router()

// Get all genres
router.get("/", genreController.getAllGenres)

// Get genre by ID
router.get("/:id", param("id").isInt(), genreController.getGenreById)

// Create new genre
router.post("/", body("name").isString().notEmpty(), genreController.createGenre)

export default router
