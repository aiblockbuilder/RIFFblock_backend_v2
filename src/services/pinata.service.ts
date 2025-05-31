import axios from "axios"
import FormData from "form-data"
import logger from "../utils/logger"
import fs from "fs"

// Validate required environment variables
const requiredEnvVars = {
    PINATA_API_KEY: process.env.PINATA_API_KEY,
    PINATA_API_SECRET: process.env.PINATA_API_SECRET,
}

// Check if all required environment variables are set
Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
        logger.error(`Missing required environment variable: ${key}`)
        throw new Error(`Missing required environment variable: ${key}`)
    }
})

const PINATA_API_KEY = process.env.PINATA_API_KEY!
const PINATA_API_SECRET = process.env.PINATA_API_SECRET!

export const pinataService = {
    async uploadToIPFS(file: Express.Multer.File, folder: string): Promise<string> {
        try {
            if (!file) {
                throw new Error("No file provided")
            }

            const formData = new FormData()
            
            // Handle both buffer and disk storage
            if (file.buffer) {
                formData.append('file', file.buffer, {
                    filename: file.originalname,
                    contentType: file.mimetype,
                })
            } else if (file.path) {
                formData.append('file', fs.createReadStream(file.path), {
                    filename: file.originalname,
                    contentType: file.mimetype,
                })
            } else {
                throw new Error("File has neither buffer nor path")
            }

            // Add metadata
            const metadata = JSON.stringify({
                name: file.originalname,
                keyvalues: {
                    folder: folder,
                    type: file.mimetype,
                }
            })
            formData.append('pinataMetadata', metadata)

            // Add options
            const options = JSON.stringify({
                cidVersion: 1,
                wrapWithDirectory: false
            })
            formData.append('pinataOptions', options)

            const response = await axios.post(
                'https://api.pinata.cloud/pinning/pinFileToIPFS',
                formData,
                {
                    headers: {
                        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
                        'pinata_api_key': PINATA_API_KEY,
                        'pinata_secret_api_key': PINATA_API_SECRET,
                    },
                }
            )

            // Return the IPFS hash (CID)
            return response.data.IpfsHash
        } catch (error) {
            logger.error("Error uploading to IPFS:", error)
            throw new Error("Failed to upload to IPFS")
        }
    },

    // Helper function to get IPFS gateway URL
    getIPFSGatewayUrl(cid: string): string {
        // Use Pinata's gateway
        return `https://gateway.pinata.cloud/ipfs/${cid}`
    }
} 