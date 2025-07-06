'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('riffs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      audioFile: {
        type: Sequelize.STRING,
        allowNull: false
      },
      coverImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      audioCid: {
        type: Sequelize.STRING,
        allowNull: false
      },
      coverCid: {
        type: Sequelize.STRING,
        allowNull: true
      },
      metadataUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      duration: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      genre: {
        type: Sequelize.STRING,
        allowNull: true
      },
      mood: {
        type: Sequelize.STRING,
        allowNull: true
      },
      instrument: {
        type: Sequelize.STRING,
        allowNull: true
      },
      keySignature: {
        type: Sequelize.STRING,
        allowNull: true
      },
      timeSignature: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isBargainBin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'RIFF'
      },
      royaltyPercentage: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 10
      },
      isStakable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      stakingRoyaltyShare: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 50
      },
      maxPool: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      minimumStakeAmount: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      lockPeriodDays: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      useProfileDefaults: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isNft: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      tokenId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contractAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      unlockSourceFiles: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      unlockRemixRights: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      unlockPrivateMessages: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      unlockBackstageContent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      creatorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      collectionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'collections',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('riffs');
  }
}; 