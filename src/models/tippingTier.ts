import { Model, Sequelize, DataTypes as DT } from "sequelize";

export default (sequelize: Sequelize, DataTypes: typeof DT) => {
  class TippingTier extends Model {
    static associate(models: any) {
      TippingTier.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    }
  }
  TippingTier.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: true }, // null for global
      name: { type: DataTypes.STRING, allowNull: false },
      amount: { type: DataTypes.INTEGER, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      perks: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true, defaultValue: [] },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { sequelize, modelName: "TippingTier", tableName: "tipping_tiers", timestamps: true }
  );
  return TippingTier;
}; 