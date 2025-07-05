'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if minimumStakeAmount column exists
    const tableDescription = await queryInterface.describeTable('riffs');
    
    if (!tableDescription.minimumStakeAmount) {
      await queryInterface.addColumn('riffs', 'minimumStakeAmount', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 100
      });
    }

    if (!tableDescription.lockPeriodDays) {
      await queryInterface.addColumn('riffs', 'lockPeriodDays', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 30
      });
    }

    if (!tableDescription.useProfileDefaults) {
      await queryInterface.addColumn('riffs', 'useProfileDefaults', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('riffs');
    
    if (tableDescription.minimumStakeAmount) {
      await queryInterface.removeColumn('riffs', 'minimumStakeAmount');
    }
    if (tableDescription.lockPeriodDays) {
      await queryInterface.removeColumn('riffs', 'lockPeriodDays');
    }
    if (tableDescription.useProfileDefaults) {
      await queryInterface.removeColumn('riffs', 'useProfileDefaults');
    }
  }
}; 