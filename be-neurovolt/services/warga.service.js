const { Warga } = require("../models");
const { Op } = require("sequelize");
const csv = require("csv-parser");
const fs = require("fs");
const { predictWarga } = require("../ml/predict");

const createWarga = async (data) => {
  const {
    nik,
    nama,
    alamat,
    usia,
    jenis_kelamin,
    pekerjaan,
    penghasilan,
    jumlah_tanggungan,
    pendidikan,
    status_rumah,
    kendaraan,
    status_pernikahan,
  } = data;

  const warga = await Warga.findOne({ where: { nik } });
  if (warga) {
    throw new Error("NIK sudah terdaftar");
  }

  return await Warga.create({
    nik,
    nama,
    pekerjaan,
    alamat,
    usia,
    jenis_kelamin,
    penghasilan,
    jumlah_tanggungan,
    pendidikan,
    status_rumah,
    kendaraan,
    status_pernikahan,
  });
};

const getAllWarga = async () => {
  const warga = await Warga.findAll();
  return warga;
};

const getStatistik = async () => {
  const total = await Warga.count();
  const miskin = await Warga.count({
    where: { penghasilan: { [Op.lt]: 2000000 } },
  });
  const menengah = await Warga.count({
    where: { penghasilan: { [Op.between]: [2000000, 5000000] } },
  });
  const atas = await Warga.count({
    where: { penghasilan: { [Op.gt]: 5000000 } },
  });
  return {
    total,
    miskin,
    menengah,
    atas,
    persentase_miskin: ((miskin / total) * 100).toFixed(2) + "%",
  };
};

const uploadCSV = async (filePath) => {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        results.push({
          id: data.id,
          nama: data.nama,
          nik: data.nik,
          alamat: data.alamat,
          usia: data.usia,
          jenis_kelamin: data.jenis_kelamin,
          pekerjaan: data.pekerjaan,
          penghasilan: data.penghasilan,
          jumlah_tanggungan: data.jumlah_tanggungan,
          pendidikan: data.pendidikan,
          status_rumah: data.status_rumah,
          kendaraan: data.kendaraan,
          status_pernikahan: data.status_pernikahan,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      })
      .on("end", async () => {
        try {
          await Warga.bulkCreate(results, { ignoreDuplicates: true });
          resolve(results);
        } catch (err) {
          reject(err);
        }
      });
  });
};

module.exports = {
  createWarga,
  getAllWarga,
  getStatistik,
  uploadCSV,
};
