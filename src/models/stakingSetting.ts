import { Model, Sequelize, DataTypes as DT } from "sequelize";

export default (sequelize: Sequelize, DataTypes: typeof DT) => {
  class StakingSetting extends Model {
    static associate(models: any) {
      StakingSetting.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    }
  }
  StakingSetting.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: true }, // null for global
      defaultStakingEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
      defaultRoyaltyShare: { type: DataTypes.INTEGER, defaultValue: 50 },
      lockPeriodDays: { type: DataTypes.INTEGER, defaultValue: 90 },
      minimumStakeAmount: { type: DataTypes.INTEGER, defaultValue: 100 },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { sequelize, modelName: "StakingSetting", tableName: "staking_settings", timestamps: true }
  );
  return StakingSetting;
}; 