require("dotenv").config();
const { User } = require("../models/");
const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findByPk(decoded.userId);
    console.log("User found:", user);

    if (!user || !user.refresh_token) {
      return res
        .status(401)
        .json({ error: "Invalid token or user logged out." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(400).json({ error: "Invalid token." });
  }
};

module.exports = authenticate;
