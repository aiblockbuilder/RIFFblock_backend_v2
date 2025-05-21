import { Model, type DataTypes, type Sequelize } from "sequelize"

interface CollectionAttributes {
  id: number
  name: string
  description: string
  coverImage: string
  creatorId: number
  createdAt: Date
  updatedAt: Date
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Collection extends Model<CollectionAttributes> implements CollectionAttributes {
    id!: number
    name!: string
    description!: string
    coverImage!: string
    creatorId!: number
    createdAt!: Date
    updatedAt!: Date

    static associate(models: any) {
      // Define associations here
      Collection.belongsTo(models.User, { foreignKey: "creatorId", as: "creator" })
      Collection.hasMany(models.Riff, { foreignKey: "collectionId", as: "riffs" })
    }
  }

  Collection.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: dataTypes.TEXT,
        allowNull: true,
      },
      coverImage: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      creatorId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
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
      modelName: "Collection",
      tableName: "collections",
      timestamps: true,
    },
  )

  return Collection
}
