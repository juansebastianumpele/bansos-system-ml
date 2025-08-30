const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const Register = async (req, res) => {
  try {
    const { name, phone, email, password, confPassword } = req.body;

    if (!name || !phone || !email || !password || !confPassword) {
      return res.status(400).json({ msg: "Semua field wajib diisi" });
    }

    if (password !== confPassword) {
      return res
        .status(400)
        .json({ msg: "Password dan konfirmasi password tidak cocok" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: "Email sudah digunakan" });
    }

    const salt = await bcrypt.genSalt(10); // pakai 10 round default
    const hashPassword = await bcrypt.hash(password, salt);

    const userCount = await User.count();
    const role = userCount === 0 ? "admin" : "user";

    await User.create({
      name,
      phone_number: phone,
      email,
      password: hashPassword,
      role,
    });

    return res.status(201).json({ msg: "Register Berhasil" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Login User
const Login = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: req.body.email },
    });

    if (!user) {
      return res.status(404).json({ msg: "Email tidak ditemukan" });
    }

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Password yang Anda masukkan salah" });
    }

    const userId = user.id;
    const name = user.name;
    const email = user.email;
    const role = user.role;

    // Membuat access token
    const accessToken = jwt.sign(
      { userId, name, email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Membuat refresh token
    const refreshToken = jwt.sign(
      { userId, name, email },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Mengupdate refresh_token di database
    await User.update(
      { refresh_token: refreshToken },
      {
        where: { id: userId },
      }
    );

    // Mengatur cookie untuk refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
    });

    res.json({ accessToken, role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan saat login" });
  }
};

// Logout User (opsional, bisa diaktifkan kembali kalau perlu)
// const Logout = async (req, res) => {
//   try {
//     const refreshToken = req.cookies.refreshToken;
//     if (!refreshToken) return res.sendStatus(204); // No content

//     const user = await User.findOne({ where: { refresh_token: refreshToken } });
//     if (!user) return res.sendStatus(204);

//     await User.update({ refresh_token: null }, { where: { id: user.id } });
//     res.clearCookie("refreshToken");
//     return res.sendStatus(200); // Logout berhasil
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Terjadi kesalahan saat logout" });
//   }
// };

const getUser = async (req, res) => {
  try {
    // NOTE: Model Lahan harus di-import kalau memang dipakai
    const users = await User.findAll({
      include: [
        {
          model: Lahan, // pastikan require("../models/lahanModels.js") kalau mau dipakai
          as: "lahan",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  Register,
  Login,
  // Logout,
  getUser,
};
