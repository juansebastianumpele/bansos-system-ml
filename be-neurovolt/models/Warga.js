"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Warga extends Model {
    static associate(models) {}
  }

  Warga.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      nik: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      nama: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      alamat: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      usia: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jenis_kelamin: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pekerjaan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      penghasilan: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jumlah_tanggungan: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pendidikan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status_rumah: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      kendaraan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status_pernikahan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      kelas: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Hasil Klasifikasi AI",
      },
      kelayakan_bansos: {
        type: DataTypes.ENUM("Layak", "tidak layak"),
        allowNull: true,
        comment: "Hasil Klasifikasi AI",
      },
    },
    {
      sequelize,
      modelName: "Warga",
      tableName: "warga",
      underscored: true,
      timestamps: true,
    }
  );

  return Warga;
};
