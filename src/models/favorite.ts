import { Model, type DataTypes, type Sequelize } from "sequelize"

interface FavoriteAttributes {
    userId: number
    riffId: number
    createdAt: Date
    updatedAt: Date
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
    class Favorite extends Model<FavoriteAttributes> implements FavoriteAttributes {
        userId!: number
        riffId!: number
        createdAt!: Date
        updatedAt!: Date

        static associate(models: any) {
            // Associations are defined in User and Riff models
            Favorite.belongsTo(models.User, { foreignKey: 'userId', as: 'users' })
            Favorite.belongsTo(models.Riff, { foreignKey: 'riffId', as: 'riffs' }) // alias must match `.as` in include
        }
    }

    Favorite.init(
        {
            userId: {
                type: dataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: "users",
                    key: "id",
                },
            },
            riffId: {
                type: dataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: "riffs",
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
            modelName: "Favorite",
            tableName: "favorites",
            timestamps: true,
        },
    )

    return Favorite
}
