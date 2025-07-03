import { Model, type DataTypes, type Sequelize } from "sequelize"

interface StakeAttributes {
  id: number
  userId: number
  riffId: number
  amount: number
  stakedAt: Date
  unlockAt: Date
  isUnlocked: boolean
  royaltiesEarned: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Stake extends Model<StakeAttributes> implements StakeAttributes {
    id!: number
    userId!: number
    riffId!: number
    amount!: number
    stakedAt!: Date
    unlockAt!: Date
    isUnlocked!: boolean
    royaltiesEarned!: number
    isActive!: boolean
    createdAt!: Date
    updatedAt!: Date

    static associate(models: any) {
      // Define associations here
      Stake.belongsTo(models.User, { foreignKey: "userId", as: "users" })
      Stake.belongsTo(models.Riff, { foreignKey: "riffId", as: "riffs" })
    }
  }

  Stake.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      riffId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "riffs",
          key: "id",
        },
      },
      amount: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      stakedAt: {
        type: dataTypes.DATE,
        allowNull: false,
        defaultValue: dataTypes.NOW,
      },
      unlockAt: {
        type: dataTypes.DATE,
        allowNull: false,
      },
      isUnlocked: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      royaltiesEarned: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      isActive: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      modelName: "Stake",
      tableName: "stakes",
      timestamps: true,
    },
  )

  return Stake
}
