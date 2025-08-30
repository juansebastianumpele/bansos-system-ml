const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const { Bantuan } = require("../models");
const fs = require("fs");
// const csv = require("csv-parser");
const csv = require("csvtojson");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Helper untuk ambil JSON dari output AI
function extractJSON(text) {
  try {
    // Cari array JSON di antara [ ... ]
    const matchArray = text.match(/\[[\s\S]*\]/);
    if (matchArray) {
      return JSON.parse(matchArray[0]);
    }

    // Jika bukan array, coba object tunggal { ... }
    const matchObject = text.match(/\{[\s\S]*\}/);
    if (matchObject) {
      return JSON.parse(matchObject[0]);
    }
  } catch (error) {
    console.error("Gagal parsing JSON:", error);
  }
  return null;
}

const tambahData = async (req, res) => {
  try {
    const data = await Bantuan.create(req.body);
    res.json({ message: "Data berhasil disimpan", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menyimpan data" });
  }
};

const cekKelayakan = async (req, res) => {
  try {
    // pastikan file dikirim di form-data key: file
    const filePath = req.file.path;

    // konversi CSV -> JSON
    const jsonData = await csv().fromFile(filePath);

    // bikin prompt
    const prompt = `
      Kamu adalah sistem seleksi bantuan sosial.
      Tentukan apakah seseorang layak atau tidak menerima bantuan.
      Kriteria utama:
      - Pendapatan di bawah UMR Rp3.000.000 → LAYAK
      - Tanggungan ≥ 3 orang → lebih prioritas
      - Tidak punya aset berharga (mobil, tanah luas) → lebih prioritas
      - Status rumah kontrak/sewa → lebih prioritas
      - Jika pendapatan tinggi (> Rp5.000.000) otomatis TIDAK LAYAK

      Berikut data yang akan dicek:
      ${JSON.stringify(jsonData)}

      Jawaban format JSON valid TANPA tambahan teks lain:
      [
        {
          "nama": "...",
          "status": "LAYAK/TIDAK LAYAK",
          "alasan": "..."
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const parsed = extractJSON(text);

    if (!parsed) {
      return res.status(500).json({
        error: "Output AI tidak valid JSON",
        raw: text,
      });
    }

    res.json({ hasil: parsed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Terjadi kesalahan pada AI Service" });
  }
};

module.exports = {
  tambahData,
  cekKelayakan,
  upload,
};
