'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      walletAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      coverImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ensName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      twitterUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      instagramUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      websiteUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      genres: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: []
      },
      influences: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: []
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
}; 