import { Model, type DataTypes, type Sequelize } from "sequelize"

interface GenreAttributes {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Genre extends Model<GenreAttributes> implements GenreAttributes {
    id!: number
    name!: string
    createdAt!: Date
    updatedAt!: Date
  }

  Genre.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: dataTypes.STRING,
        allowNull: false,
        unique: true,
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
      modelName: "Genre",
      tableName: "genres",
      timestamps: true,
    },
  )

  return Genre
}
