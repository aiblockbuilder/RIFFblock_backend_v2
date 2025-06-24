'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('riffs', 'minimumStakeAmount', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 100
    });

    await queryInterface.addColumn('riffs', 'lockPeriodDays', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 30
    });

    await queryInterface.addColumn('riffs', 'useProfileDefaults', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('riffs', 'minimumStakeAmount');
    await queryInterface.removeColumn('riffs', 'lockPeriodDays');
    await queryInterface.removeColumn('riffs', 'useProfileDefaults');
  }
}; 