# RIFFblock Backend

This is the backend service for the RIFFblock platform, a music NFT marketplace that allows artists to create, distribute, and monetize music through blockchain technology.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Database](#database)
  - [Schema](#schema)
  - [Migrations](#migrations)
  - [Seeders](#seeders)
- [API Documentation](#api-documentation)
- [Blockchain Integration](#blockchain-integration)
- [File Storage](#file-storage)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

The RIFFblock backend provides a RESTful API for the frontend application, handling user profiles, NFT management, collections, marketplace listings, staking, and tipping functionalities. It integrates with blockchain technology to enable NFT minting, staking, and rewards.

## Technology Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Programming language
- **PostgreSQL** - Database
- **Sequelize** - ORM for database interactions
- **Ethers.js** - Blockchain interaction library
- **Multer** - File upload handling
- **Winston** - Logging

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Blockchain provider account (Infura, Alchemy, etc.)

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`
3. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
4. Create a `.env` file based on `.env.example`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
5. Update the `.env` file with your configuration
6. Run database migrations:
   \`\`\`bash
   npx sequelize-cli db:migrate
   \`\`\`
7. (Optional) Seed the database:
   \`\`\`bash
   npx sequelize-cli db:seed:all
   \`\`\`
8. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Port the server will run on | 3001 |
| DB_USER | PostgreSQL database username | postgres |
| DB_PASSWORD | PostgreSQL database password | password |
| DB_NAME | PostgreSQL database name | riffblock |
| DB_HOST | PostgreSQL database host | localhost |
| DB_PORT | PostgreSQL database port | 5432 |
| UPLOAD_DIR | Directory for file uploads | uploads |
| MAX_FILE_SIZE | Maximum file size for uploads (in bytes) | 10485760 |
| CONTRACT_ADDRESS | Blockchain contract address | 0x... |
| BLOCKCHAIN_PROVIDER_URL | URL for blockchain provider | https://mainnet.infura.io/v3/YOUR_API_KEY |

## Database

### Schema

The database consists of the following main tables:

- **Users**: Stores user profiles and wallet addresses
- **Riffs**: Stores NFT metadata and file references
- **Collections**: Groups of NFTs created by users
- **Stakes**: Records of staking activities
- **Tips**: Records of tipping transactions
- **Genres**: Music genres for categorization
- **Tags**: Additional metadata tags for NFTs
- **RiffTags**: Junction table for many-to-many relationship between Riffs and Tags

### Migrations

Database migrations are managed using Sequelize CLI. To run migrations:

\`\`\`bash
npx sequelize-cli db:migrate
\`\`\`

To undo the most recent migration:

\`\`\`bash
npx sequelize-cli db:migrate:undo
\`\`\`

### Seeders

Seeders are available to populate the database with initial data:

\`\`\`bash
npx sequelize-cli db:seed:all
\`\`\`

## API Documentation

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/:walletAddress | Get user profile |
| PUT | /api/users/:walletAddress | Update user profile |
| GET | /api/users/:walletAddress/nfts | Get user's NFTs |
| GET | /api/users/:walletAddress/collections | Get user's collections |
| GET | /api/users/:walletAddress/activity | Get user's activity |
| GET | /api/users/:walletAddress/tipping-tiers | Get user's tipping tiers |
| GET | /api/users/:walletAddress/favorites | Get user's favorites |
| GET | /api/users/:walletAddress/staking-settings | Get user's staking settings |
| POST | /api/users/upload-avatar | Upload profile avatar |
| POST | /api/users/upload-cover | Upload profile cover image |

### NFT (Riff) Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/nfts/ | Get all NFTs with filtering |
| GET | /api/nfts/:id | Get NFT by ID |
| GET | /api/nfts/activity/:id | Get NFT activity |
| POST | /api/nfts/upload | Upload a new NFT (audio file) |
| POST | /api/nfts/:id/mint | Mint an NFT |
| GET | /api/nfts/rewards/:id/:walletAddress | Get staking rewards |
| POST | /api/nfts/rewards-claim/:id/:walletAddress | Claim rewards |

### Favorite Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/favorite/add/:id/:walletAddress | Add NFT to favorites |
| POST | /api/favorite/remove/:id/:walletAddress | Remove NFT from favorites |

### Marketplace Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/marketplace/listings | Get all listings |
| GET | /api/marketplace/listings/:id | Get listing by ID |
| GET | /api/marketplace/sales/:id | Get sales history by ID |
| PUT | /api/marketplace/listings/:id | Update listing |
| POST | /api/marketplace/listings | Create new listing |

### Collection Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/collections/ | Get all collections |
| GET | /api/collections/:id | Get collection by ID |
| POST | /api/collections/ | Create new collection |
| POST | /api/collections/cover/:id | Upload collection cover image |
| GET | /api/collections/nfts/:id | Get NFTs in a collection |

### Staking Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/staking/:nftId | Get NFT staking info |
| POST | /api/staking/stake/:nftId/:walletAddress | Stake on an NFT |
| POST | /api/staking/unstake/:nftId/:walletAddress | Unstake from an NFT |

## Blockchain Integration

The backend integrates with blockchain using Ethers.js. Key functionalities include:

- NFT minting
- Staking management
- Reward calculations
- Transaction verification

## File Storage

Files are stored locally by default in the `uploads` directory. The structure is:

- `uploads/avatars/` - User profile avatars
- `uploads/covers/` - User profile and collection covers
- `uploads/riffs/` - Audio files for NFTs

For production, consider using a cloud storage solution like AWS S3.

## Development

To start the development server with hot reloading:

\`\`\`bash
npm run dev
\`\`\`

To build the TypeScript code:

\`\`\`bash
npm run build
\`\`\`

To run the compiled code:

\`\`\`bash
npm start
\`\`\`

## Deployment

### Production Build

1. Build the TypeScript code:
   \`\`\`bash
   npm run build
   \`\`\`

2. Set environment variables for production

3. Start the server:
   \`\`\`bash
   npm start
   \`\`\`

### Docker Deployment

A Dockerfile is provided for containerized deployment:

\`\`\`bash
# Build the Docker image
docker build -t riffblock-backend .

# Run the container
docker run -p 3001:3001 --env-file .env riffblock-backend
\`\`\`

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check database credentials in .env file
   - Ensure database exists

2. **File Upload Issues**
   - Check if upload directory exists and has write permissions
   - Verify MAX_FILE_SIZE is appropriate for your needs

3. **Blockchain Integration Issues**
   - Verify CONTRACT_ADDRESS is correct
   - Check BLOCKCHAIN_PROVIDER_URL is accessible
   - Ensure you have sufficient funds for gas fees if testing on mainnet

### Logs

Logs are stored in the `logs` directory:
- `error.log` - Error messages
- `combined.log` - All log messages

For additional help, check the console output when running in development mode.
