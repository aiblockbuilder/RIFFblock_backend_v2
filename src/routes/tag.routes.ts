import express from "express"
import { body, param } from "express-validator"
import tagController from "../controllers/tag.controller"

const router = express.Router()

// Get all tags
router.get("/", tagController.getAllTags)

// Get tag by ID
router.get("/:id", param("id").isInt(), tagController.getTagById)

// Create new tag
router.post("/", body("name").isString().notEmpty(), tagController.createTag)

export default router
