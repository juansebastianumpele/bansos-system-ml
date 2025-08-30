const express = require("express");
const router = express.Router();
const { getStatistik } = require("../controllers/statistik.controller");

router.get("/", getStatistik);

module.exports = router;
