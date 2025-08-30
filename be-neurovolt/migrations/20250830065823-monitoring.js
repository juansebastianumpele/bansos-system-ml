// migrations/2024xx-create-monitoring.js (nama file mungkin berbeda)

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("monitoring", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      periode: {
        type: Sequelize.DATE,
        allowNull: false,
        unique: true, // ⭐ Tambahkan ini untuk ON DUPLICATE KEY UPDATE
      },
      total_warga: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      jumlah_miskin: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      persentase_miskin: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      // ⭐ Kolom baru untuk timestamps
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("monitoring");
  },
};
