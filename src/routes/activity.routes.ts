import express from "express"
import { body, param } from "express-validator"
import userController from "../controllers/user.controller"

const router = express.Router()

// Get all activity
router.get("/", userController.getAllActivity)

// Get user's activity
router.get("/:walletAddress", param("walletAddress").isString().notEmpty(), userController.getUserActivity)

export default router
