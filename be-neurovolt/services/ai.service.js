const tf = require("@tensorflow/tfjs");
const path = require("path");

// Field fitur yang digunakan untuk prediksi
const features = ["usia", "penghasilan", "jumlah_tanggungan"];

let model;

// Load pre-trained model sekali saja
const loadModel = async () => {
  if (!model) {
    const modelPath = `file://${path.resolve(
      __dirname,
      "../ai-model/model.json"
    )}`;
    model = await tf.loadLayersModel(modelPath);
    console.log("AI model loaded");
  }
  return model;
};

// Preprocessing data sebelum prediksi
const preprocess = (data) => {
  return data.map((row) => ({
    usia: Number(row.usia) / 100,
    penghasilan: Number(row.penghasilan) / 10000000, // skala 0-1
    jumlah_tanggungan: Number(row.jumlah_tanggungan) / 10,
  }));
};

// Fungsi prediksi
const predictWarga = async (data) => {
  const model = await loadModel();
  const input = preprocess(data);
  const xs = tf.tensor2d(
    input.map((d) => [d.usia, d.penghasilan, d.jumlah_tanggungan])
  );
  const predictions = model.predict(xs).arraySync();

  return data.map((row, idx) => {
    const kelasIndex = predictions[idx].indexOf(Math.max(...predictions[idx]));
    const kelas = ["bawah", "menengah", "atas"][kelasIndex];
    return { ...row, kelas_bansos: kelas };
  });
};

module.exports = { predictWarga };
