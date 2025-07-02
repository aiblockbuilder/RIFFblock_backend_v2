'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('riffs', 'metadataUrl', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'IPFS URI for NFT metadata (ipfs://{cid})'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('riffs', 'metadataUrl');
  }
}; 