const wargaService = require("../services/warga.service");

const createWarga = async (req, res) => {
  try {
    const warga = await wargaService.createWarga(req.body);
    res
      .status(201)
      .json({ message: "Warga berhasil ditambahkan", data: warga });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllWarga = async (req, res) => {
  try {
    const warga = await wargaService.getAllWarga();
    res
      .status(200)
      .json({ message: "Berhasil mengambil data warga:", data: warga });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStatistik = async (req, res) => {
  try {
    const statistik = await wargaService.getStatistik();
    res.status(200).json({ message: "Statistik warga:", data: statistik });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadCSV = async (req, res) => {
  try {
    const result = await wargaService.uploadCSV(req.file.path);
    res.status(200).json({ message: "Upload berhasil", data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const createWargaAI = async (req, res) => {
//   try {
//     const warga = await wargaService.createWargaAI(req.body);
//     res.status(201).json({
//       message: "Warga berhasil ditambahkan dengan prediksi AI",
//       data: warga,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const { Warga } = require("../models");
// const { trainModel } = require("../ml/train");
// const { predictWarga } = require("../ml/predict");
// const fs = require("fs");

// const uploadCSVController = async (req, res) => {
//   if (!req.file) return res.status(400).json({ message: "File CSV tidak ada" });

//   // latih model dengan CSV baru
//   await trainModel(req.file.path);

//   res.json({ message: "CSV berhasil diupload dan model AI diperbarui" });
// };

// const createWargaAI = async (req, res) => {
//   const warga = req.body;
//   const kelas = await predictWarga(warga);

//   const newWarga = await Warga.create({ ...warga, kelas });

//   res.json({
//     message: "Warga berhasil ditambahkan dengan prediksi AI",
//     data: newWarga,
//   });
// };

// const getWarga = async (req, res) => {
//   const warga = await Warga.findAll();
//   res.json({ message: "Data warga:", data: warga });
// };

module.exports = {
  createWarga,
  getAllWarga,
  getStatistik,
  uploadCSV,
  // createWargaAI,
  // trainModel,
  // uploadCSVController,
  // getWarga,
};
