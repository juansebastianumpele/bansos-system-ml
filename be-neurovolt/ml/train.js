const tf = require("@tensorflow/tfjs");
const fs = require("fs");
const csv = require("csv-parser");

async function trainModel(csvFilePath) {
  const data = [];
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => data.push(row))
    .on("end", async () => {
      console.log("CSV loaded:", data.length);

      // fitur numerik
      const xs = data.map((d) => [
        Number(d.usia),
        Number(d.penghasilan),
        Number(d.jumlah_tanggungan),
        d.jenis_kelamin === "Laki-laki" ? 0 : 1,
        d.pendidikan === "SMA" ? 1 : d.pendidikan === "S1" ? 2 : 3,
        d.status_rumah === "Milik Sendiri" ? 1 : 0,
        d.kendaraan === "Motor" ? 1 : 0,
      ]);

      // label
      const ys = data.map((d) =>
        d.kelas === "miskin" ? 0 : d.kelas === "menengah" ? 1 : 2
      );

      const xsTensor = tf.tensor2d(xs);
      const ysTensor = tf.tensor1d(ys, "int32");
      const ysOneHot = tf.oneHot(ysTensor, 3);

      const model = tf.sequential();
      model.add(
        tf.layers.dense({
          inputShape: [xs[0].length],
          units: 16,
          activation: "relu",
        })
      );
      model.add(tf.layers.dense({ units: 16, activation: "relu" }));
      model.add(tf.layers.dense({ units: 3, activation: "softmax" }));

      model.compile({
        optimizer: "adam",
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"],
      });

      await model.fit(xsTensor, ysOneHot, {
        epochs: 50,
        batchSize: 16,
        validationSplit: 0.2,
      });
      await model.save("file://ml/model");

      console.log("Model trained and saved!");
    });
}

// contoh pemanggilan
// trainModel("uploads/warga.csv");

module.exports = { trainModel };
