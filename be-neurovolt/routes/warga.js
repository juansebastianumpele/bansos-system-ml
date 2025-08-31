const express = require("express");
const router = express.Router();
const wargaController = require("../controllers/warga.controller");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.post("/process-data", wargaController.processData);

router.post("/", wargaController.createWarga);
router.get("/", wargaController.getWarga);
router.get("/statistik", wargaController.getStatistik);
router.get("/monitoring", wargaController.getMonitoring);

module.exports = router;
