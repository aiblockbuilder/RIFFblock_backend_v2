import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import logger from "../utils/logger"

// Validate required environment variables
const requiredEnvVars = {
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
}

// Check if all required environment variables are set
Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
        logger.error(`Missing required environment variable: ${key}`)
        throw new Error(`Missing required environment variable: ${key}`)
    }
})

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

export const storageService = {
    async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
        try {
            if (!file || !file.buffer) {
                throw new Error("No file or file buffer provided")
            }

            const key = `${folder}/${Date.now()}-${file.originalname}`
            
            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            })

            await s3Client.send(command)
            
            // Return the public URL
            return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
        } catch (error) {
            logger.error("Error uploading to S3:", error)
            throw new Error("Failed to upload image")
        }
    },

    async deleteImage(url: string): Promise<void> {
        try {
            if (!url) {
                logger.warn("No URL provided for image deletion")
                return
            }

            // Skip deletion for default images
            if (url.includes("/neon-profile.png") || url.includes("/profile_avatar.jpg")) {
                logger.info("Skipping deletion of default image")
                return
            }

            // Extract key from URL - handle both S3 and local URLs
            let key: string | undefined
            if (url.includes("amazonaws.com")) {
                key = url.split(".amazonaws.com/")[1]
            } else if (url.includes("/uploads/")) {
                key = url.split("/uploads/")[1]
            }

            if (!key) {
                logger.warn("Could not extract key from URL:", url)
                return
            }
            
            const command = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            })

            await s3Client.send(command)
        } catch (error) {
            logger.error("Error deleting from S3:", error)
            throw new Error("Failed to delete image")
        }
    },

    async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            })

            return await getSignedUrl(s3Client, command, { expiresIn })
        } catch (error) {
            logger.error("Error getting signed URL:", error)
            throw new Error("Failed to get signed URL")
        }
    }
} 