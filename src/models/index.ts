import fs from "fs"
import path from "path"
import { Sequelize, DataTypes } from "sequelize"
import config from "../config/database"

type Environment = 'development' | 'test' | 'production'
const env = (process.env.NODE_ENV || "development") as Environment
const dbConfig = config[env]

if (!dbConfig.database || !dbConfig.username || !dbConfig.password || !dbConfig.host || !dbConfig.port) {
  throw new Error('Database configuration is incomplete')
}

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: parseInt(dbConfig.port),
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  pool: dbConfig.pool,
})

const db: any = {
  sequelize,
  Sequelize,
}

// Import all model files
const basename = path.basename(__filename)
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      (file.slice(-3) === ".ts" || file.slice(-3) === ".js") &&
      file.indexOf(".test.") === -1
    )
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file)).default(sequelize, DataTypes)
    db[model.name] = model
  })

// Associate models if they have associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

export default db
