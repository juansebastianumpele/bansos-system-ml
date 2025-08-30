const { Warga } = require("../models");
const {
  predictOne,
  predictBatch,
  trainCSV,
  checkEligibility,
  monitoringCSV,
  processCSV,
  getMonitoringData,
} = require("../services/ml.service");
const csv = require("csv-parser");
const upload = require("../config/multer.config");

// CREATE WARGA + KLASIFIKASI
exports.createWarga = async (req, res) => {
  try {
    const body = req.body;
    const newWarga = await Warga.create(body);

    // siapkan payload fitur minimal untuk ML
    const payload = {
      usia: newWarga.usia,
      penghasilan: newWarga.penghasilan,
      jumlah_tanggungan: newWarga.jumlah_tanggungan,
      pendidikan: newWarga.pendidikan,
      status_rumah: newWarga.status_rumah,
      kendaraan: newWarga.kendaraan,
      status_pernikahan: newWarga.status_pernikahan,
      pekerjaan: newWarga.pekerjaan,
      jenis_kelamin: newWarga.jenis_kelamin,
    };

    const pred = await predictOne(payload);
    await newWarga.update({ kelas: pred.kelas, proba: pred.proba });

    res
      .status(201)
      .json({ message: "Warga berhasil ditambahkan", data: newWarga });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Gagal menambahkan warga", error: err.message });
  }
};

// GET WARGA LIST
exports.getWarga = async (req, res) => {
  try {
    const rows = await Warga.findAll({ order: [["createdAt", "DESC"]] });
    res.json({ message: "Berhasil mengambil data warga:", data: rows });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data", error: err.message });
  }
};

// Hitung statistik warga
exports.getStatistik = async (req, res) => {
  try {
    const total = await Warga.count();

    // Hitung jumlah tiap kelas
    const miskin = await Warga.count({ where: { kelas: "miskin" } });
    const menengah = await Warga.count({ where: { kelas: "menengah" } });
    const atas = await Warga.count({ where: { kelas: "atas" } });

    const persentaseMiskin =
      total > 0 ? ((miskin / total) * 100).toFixed(2) : 0;
    const persentaseMenengah =
      total > 0 ? ((menengah / total) * 100).toFixed(2) : 0;
    const persentaseAtas = total > 0 ? ((atas / total) * 100).toFixed(2) : 0;

    return res.json({
      message: "Statistik warga:",
      data: {
        total,
        miskin,
        menengah,
        atas,
        persentase_miskin: persentaseMiskin + "%",
        persentase_menengah: persentaseMenengah + "%",
        persentase_atas: persentaseAtas + "%",
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

// ⭐ Perbaikan Utama: Menggunakan satu alur tunggal untuk memproses CSV.
// Jalur ini hanya memanggil ML service.
exports.processData = [
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "File CSV tidak ditemukan" });
      }

      // Memanggil fungsi tunggal di service ML
      // Kode Python yang akan menangani seluruh alur:
      // train -> predict -> simpan ke DB -> simpan monitoring
      const mlResponse = await processCSV(
        req.file.buffer,
        req.file.originalname,
        true
      );

      // Mengirimkan respons dari service ML langsung ke klien
      res.status(200).json({
        message: "Proses data selesai",
        data: mlResponse,
      });
    } catch (err) {
      console.error(
        "Error dari controller processData:",
        err.response?.data || err.message
      );
      res.status(500).json({
        message: "Gagal memproses data",
        error: err.response?.data?.detail || err.message,
      });
    }
  },
];

// Endpoint baru untuk mengambil data monitoring
exports.getMonitoring = async (req, res) => {
  try {
    const result = await getMonitoringData();
    res.json({
      message: "Data monitoring berhasil diambil",
      data: result.monitor_data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal mengambil data monitoring",
      error: err.message,
    });
  }
};
