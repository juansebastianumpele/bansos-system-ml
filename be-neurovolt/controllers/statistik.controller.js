const { Warga } = require("../models");

const getStatistik = async (req, res) => {
  const warga = await Warga.findAll();
  const total = warga.length;
  const miskin = warga.filter((w) => w.kelas === "miskin").length;
  const menengah = warga.filter((w) => w.kelas === "menengah").length;
  const atas = warga.filter((w) => w.kelas === "atas").length;

  res.json({
    message: "Statistik warga:",
    data: {
      total,
      miskin,
      menengah,
      atas,
      persentase_miskin: ((miskin / total) * 100).toFixed(2) + "%",
    },
  });
};

module.exports = { getStatistik };
