const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const { Login, Register, Logout, getUser } = require("../controllers/user");
const {
  tambahData,
  cekKelayakan,
  getDataBantuan,
} = require("../controllers/validasiBLT");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/test", (req, res, next) => {
  res.json({ message: "API is working!" });
});

router.post("/register", Register);
router.post("/login", Login);
router.get("/getUser", getUser);

router.post("/cekKelayakan", upload.single("file"), cekKelayakan);

module.exports = router;
