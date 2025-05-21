import { Model, type DataTypes, type Sequelize } from "sequelize"

interface RiffTagAttributes {
  id: number
  riffId: number
  tagId: number
  createdAt: Date
  updatedAt: Date
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class RiffTag extends Model<RiffTagAttributes> implements RiffTagAttributes {
    id!: number
    riffId!: number
    tagId!: number
    createdAt!: Date
    updatedAt!: Date
  }

  RiffTag.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      riffId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "riffs",
          key: "id",
        },
      },
      tagId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "tags",
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
      modelName: "RiffTag",
      tableName: "riff_tags",
      timestamps: true,
    },
  )

  return RiffTag
}
