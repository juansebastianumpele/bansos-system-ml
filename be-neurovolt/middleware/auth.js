require("dotenv").config();
const { User } = require("../models/");
const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Mengambil token dari header Authorization: Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Verifikasi token menggunakan secret
    console.log("Decoded token:", decoded); // Log hasil decode token

    const user = await User.findByPk(decoded.userId); // Memperbaiki dengan menggunakan userId
    console.log("User found:", user); // Log untuk memeriksa apakah user ditemukan

    // Memeriksa apakah user tidak ditemukan atau sudah logout
    if (!user || !user.refresh_token) {
      return res
        .status(401)
        .json({ error: "Invalid token or user logged out." });
    }

    req.user = user; // Menambahkan objek user ke request
    next();
  } catch (error) {
    console.error("Authentication error:", error); // Log error jika terjadi masalah dengan token
    res.status(400).json({ error: "Invalid token." });
  }
};

module.exports = authenticate;
