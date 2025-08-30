"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("warga", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nik: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      nama: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      alamat: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      usia: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      jenis_kelamin: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      pekerjaan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      penghasilan: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      jumlah_tanggungan: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      pendidikan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status_rumah: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      kendaraan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status_pernikahan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      kelas: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Hasil Klasifikasi AI",
      },
      kelayakan_bansos: {
        type: Sequelize.ENUM("layak", "tidak layak"),
        allowNull: true,
        comment: "Hasil Klasifikasi AI",
      },
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
    await queryInterface.dropTable("warga");
  },
};
