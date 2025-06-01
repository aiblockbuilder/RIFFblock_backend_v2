# RIFFblock Backend

This is the backend service for the RIFFblock platform, a music NFT marketplace that allows artists to create, distribute, and monetize music through blockchain technology.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

The RIFFblock backend provides a RESTful API for the frontend application, handling user profiles, NFT management, collections, marketplace listings, staking, and tipping functionalities. It integrates with blockchain technology to enable NFT minting, staking, and rewards.

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middlewares/    # Custom middleware functions
├── models/         # Database models
├── routes/         # API route definitions
├── services/       # Business logic
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── migrations/     # Database migrations
└── index.ts        # Application entry point
```

## Technology Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Programming language
- **PostgreSQL** - Database
- **Sequelize** - ORM for database interactions
- **Ethers.js** - Blockchain interaction library
- **Multer** - File upload handling
- **Winston** - Logging
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Blockchain provider account (Infura, Alchemy, etc.)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your configuration
5. Run database migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Port the server will run on | 3001 |
| DB_USER | PostgreSQL database username | postgres |
| DB_PASSWORD | PostgreSQL database password | password |
| DB_NAME | PostgreSQL database name | riffblock |
| DB_HOST | PostgreSQL database host | localhost |
| DB_PORT | PostgreSQL database port | 5432 |
| NODE_ENV | Environment (development/production) | development |
| CONTRACT_ADDRESS | Blockchain contract address | 0x... |
| BLOCKCHAIN_PROVIDER_URL | URL for blockchain provider | https://mainnet.infura.io/v3/YOUR_API_KEY |

## API Documentation

The API is organized into the following main sections:

### User Management
- User profile management
- Authentication and authorization
- Profile image uploads

### NFT Management
- NFT creation and minting
- Metadata management
- File uploads

### Marketplace
- Listing management
- Sales tracking
- Price management

### Collections
- Collection creation and management
- NFT grouping
- Collection metadata

### Staking
- Staking operations
- Reward calculations
- Stake management

## Development

To start the development server with hot reloading:

```bash
npm run dev
```

To build the TypeScript code:

```bash
npm run build
```

To run the compiled code:

```bash
npm start
```

## Deployment

### Production Build

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Set environment variables for production

3. Start the server:
   ```bash
   npm start
   ```

### Docker Deployment

A Dockerfile is provided for containerized deployment:

```bash
# Build the Docker image
docker build -t riffblock-backend .

# Run the container
docker run -p 3001:3001 --env-file .env riffblock-backend
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check database credentials in .env file
   - Ensure database exists

2. **File Upload Issues**
   - Check if upload directory exists and has write permissions
   - Verify file size limits in the configuration

3. **Blockchain Integration Issues**
   - Verify CONTRACT_ADDRESS is correct
   - Check BLOCKCHAIN_PROVIDER_URL is accessible
   - Ensure you have sufficient funds for gas fees if testing on mainnet

### Logs

Logs are stored in the `logs` directory:
- `error.log` - Error messages
- `combined.log` - All log messages

For additional help, check the console output when running in development mode.
