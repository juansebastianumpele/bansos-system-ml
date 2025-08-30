// Anda dapat membuat file terpisah, misalnya: config/multer.config.js
const multer = require("multer");

// Gunakan memoryStorage untuk menyimpan file di RAM
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

module.exports = upload;
