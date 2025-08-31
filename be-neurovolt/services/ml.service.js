const axios = require("axios");
require("dotenv").config();
const FormData = require("form-data");

const ML_BASE_URL = process.env.ML_BASE_URL;

async function processCSV(fileBuffer, originalFileName, train_first = true) {
  try {
    const url = `${ML_BASE_URL}/process-csv?train_first=${train_first}`;
    const form = new FormData();

    form.append("file", fileBuffer, {
      filename: originalFileName,
      contentType: "text/csv",
    });

    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxBodyLength: Infinity,
      timeout: 300000,
    });

    return response.data;
  } catch (err) {
    console.error(
      "Error from ML service (processCSV):",
      err.response?.data || err.message
    );
    throw new Error(err.response?.data?.detail || err.message);
  }
}

async function getMonitoringData() {
  try {
    const url = `${ML_BASE_URL}/monitoring`;
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    console.error(
      "Error from ML service (getMonitoringData):",
      err.response?.data || err.message
    );
    throw new Error(err.response?.data?.detail || err.message);
  }
}

module.exports = {
  processCSV,
  getMonitoringData,
};
