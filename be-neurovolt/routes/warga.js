const express = require("express");
const router = express.Router();
const wargaController = require("../controllers/warga.controller");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

/**
 * ROUTES CRUD WARGA
 */

// Endpoint untuk memproses data
router.post("/process-data", wargaController.processData);

router.post("/", wargaController.createWarga); // Tambah warga
router.get("/", wargaController.getWarga); // Ambil semua warga
router.get("/statistik", wargaController.getStatistik); // Statistik warga
router.get("/monitoring", wargaController.getMonitoring); // Statistik warga

module.exports = router;
