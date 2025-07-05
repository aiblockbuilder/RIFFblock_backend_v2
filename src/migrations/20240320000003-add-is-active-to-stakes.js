'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('stakes');
    
    if (!tableDescription.isActive) {
      await queryInterface.addColumn('stakes', 'isActive', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('stakes');
    
    if (tableDescription.isActive) {
      await queryInterface.removeColumn('stakes', 'isActive');
    }
  }
}; 