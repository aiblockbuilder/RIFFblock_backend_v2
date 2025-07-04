'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('riffs');
    
    if (!tableDescription.metadataUrl) {
      await queryInterface.addColumn('riffs', 'metadataUrl', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'IPFS URI for NFT metadata (ipfs://{cid})'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('riffs');
    
    if (tableDescription.metadataUrl) {
      await queryInterface.removeColumn('riffs', 'metadataUrl');
    }
  }
}; 