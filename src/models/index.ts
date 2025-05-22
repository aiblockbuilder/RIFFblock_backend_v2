import fs from "fs"
import path from "path"
import { Sequelize, DataTypes } from "sequelize"
import config, { Environment } from "../config/database"

const env = process.env.NODE_ENV || "development"
const dbConfig = config[env as Environment]

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
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
