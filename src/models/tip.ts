import { Model, type DataTypes, type Sequelize } from "sequelize"

interface TipAttributes {
  id: number
  userId: number
  recipientId: number
  riffId: number
  amount: number
  currency: string
  message: string
  tierId: number
  createdAt: Date
  updatedAt: Date
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Tip extends Model<TipAttributes> implements TipAttributes {
    id!: number
    userId!: number
    recipientId!: number
    riffId!: number
    amount!: number
    currency!: string
    message!: string
    tierId!: number
    createdAt!: Date
    updatedAt!: Date

    static associate(models: any) {
      // Define associations here
      Tip.belongsTo(models.User, { foreignKey: "userId", as: "user" })
      Tip.belongsTo(models.User, { foreignKey: "recipientId", as: "recipient" })
      Tip.belongsTo(models.Riff, { foreignKey: "riffId", as: "riff" })
    }
  }

  Tip.init(
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
      recipientId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      riffId: {
        type: dataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "riffs",
          key: "id",
        },
      },
      amount: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: dataTypes.STRING,
        allowNull: false,
        defaultValue: "RIFF",
      },
      message: {
        type: dataTypes.TEXT,
        allowNull: true,
      },
      tierId: {
        type: dataTypes.INTEGER,
        allowNull: true,
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
      modelName: "Tip",
      tableName: "tips",
      timestamps: true,
    },
  )

  return Tip
}
