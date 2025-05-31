import dotenv from 'dotenv'
import { Dialect } from 'sequelize'

dotenv.config()

interface DatabaseConfig {
  username: string | undefined
  password: string | undefined
  database: string | undefined
  host: string | undefined
  port: string | undefined
  dialect: Dialect
  logging: boolean | Console['log']
  pool?: {
    max: number
    min: number
    acquire: number
    idle: number
  }
}

interface Config {
  development: DatabaseConfig
  test: DatabaseConfig
  production: DatabaseConfig
}

const config: Config = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: console.log,
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME + "_test",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
}

export default config 