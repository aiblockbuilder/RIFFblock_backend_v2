import { Model, type DataTypes, type Sequelize } from "sequelize"

interface TagAttributes {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Tag extends Model<TagAttributes> implements TagAttributes {
    id!: number
    name!: string
    createdAt!: Date
    updatedAt!: Date

    static associate(models: any) {
      // Define associations here
      Tag.belongsToMany(models.Riff, { through: models.RiffTag, foreignKey: "tagId", as: "riffs" })
    }
  }

  Tag.init(
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
      modelName: "Tag",
      tableName: "tags",
      timestamps: true,
    },
  )

  return Tag
}
