'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('staking_settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      defaultStakingEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      defaultRoyaltyShare: {
        type: Sequelize.INTEGER,
        defaultValue: 50
      },
      lockPeriodDays: {
        type: Sequelize.INTEGER,
        defaultValue: 90
      },
      minimumStakeAmount: {
        type: Sequelize.INTEGER,
        defaultValue: 100
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('staking_settings');
  }
}; 