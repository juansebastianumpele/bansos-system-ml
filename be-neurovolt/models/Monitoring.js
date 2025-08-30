// models/monitoring.js

"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Monitoring extends Model {
    static associate(models) {}
  }

  Monitoring.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      periode: {
        type: DataTypes.DATE,
        allowNull: false,
        unique: true, // ⭐ Tambahkan ini di model juga
      },
      total_warga: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jumlah_miskin: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      persentase_miskin: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Monitoring",
      tableName: "monitoring",
      underscored: true,
      timestamps: true,
    }
  );

  return Monitoring;
};
