'use strict';

const { DataTypes } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        await queryInterface.addColumn("riffs", "audioCid", {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "", // Temporary default value for existing records
        });

        await queryInterface.addColumn("riffs", "coverCid", {
            type: DataTypes.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("riffs", "audioCid");
        await queryInterface.removeColumn("riffs", "coverCid");
    }
}; 