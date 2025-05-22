import { Model, type DataTypes, type Sequelize } from "sequelize"

interface UserAttributes {
  id: number
  walletAddress: string
  name: string
  bio: string
  location: string
  avatar: string
  coverImage: string
  ensName: string
  twitterUrl: string
  instagramUrl: string
  websiteUrl: string
  genres: string[]
  influences: string[]
  createdAt: Date
  updatedAt: Date
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class User extends Model<UserAttributes> implements UserAttributes {
    id!: number
    walletAddress!: string
    name!: string
    bio!: string
    location!: string
    avatar!: string
    coverImage!: string
    ensName!: string
    twitterUrl!: string
    instagramUrl!: string
    websiteUrl!: string
    genres!: string[]
    influences!: string[]
    createdAt!: Date
    updatedAt!: Date

    static associate(models: any) {
      // Define associations here
      User.hasMany(models.Riff, { foreignKey: "creatorId", as: "riffs" })
      User.hasMany(models.Collection, { foreignKey: "creatorId", as: "collections" })
      User.hasMany(models.Stake, { foreignKey: "userId", as: "stakes" })
      User.hasMany(models.Tip, { foreignKey: "userId", as: "tips" })
      User.hasMany(models.Tip, { foreignKey: "recipientId", as: "receivedTips" })
      User.belongsToMany(models.Riff, { through: models.Favorite, foreignKey: "userId", as: "favoritedRiffs" })
    }
  }

  User.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      walletAddress: {
        type: dataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      bio: {
        type: dataTypes.TEXT,
        allowNull: true,
      },
      location: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      avatar: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      coverImage: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      ensName: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      twitterUrl: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      instagramUrl: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      websiteUrl: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      genres: {
        type: dataTypes.ARRAY(dataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      influences: {
        type: dataTypes.ARRAY(dataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      createdAt: {
        type: dataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: dataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
    },
  )

  return User
}
