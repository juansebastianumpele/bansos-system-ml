const tf = require("@tensorflow/tfjs");

async function predictWarga(warga) {
  const model = await tf.loadLayersModel("file://ml/model/model.json");

  const input = tf.tensor2d([
    [
      Number(warga.usia),
      Number(warga.penghasilan),
      Number(warga.jumlah_tanggungan),
      warga.jenis_kelamin === "Laki-laki" ? 0 : 1,
      warga.pendidikan === "SMA" ? 1 : warga.pendidikan === "S1" ? 2 : 3,
      warga.status_rumah === "Milik Sendiri" ? 1 : 0,
      warga.kendaraan === "Motor" ? 1 : 0,
    ],
  ]);

  const prediction = model.predict(input);
  const classIndex = prediction.argMax(-1).dataSync()[0];
  const kelas = ["miskin", "menengah", "atas"][classIndex];
  return kelas;
}

module.exports = { predictWarga };
