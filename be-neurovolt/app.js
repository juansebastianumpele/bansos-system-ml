require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

// const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const wargaRouter = require("./routes/warga");
const statistikRouter = require("./routes/statistik");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));

// app.use("/", indexRouter);
app.use("/user", usersRouter);
app.use("/warga", wargaRouter);
app.use("/statistik", statistikRouter);

console.log("App is Starting...");
console.log("URL :", process.env.CLIENT_URL);
console.log("PORT :", process.env.PORT || 3000);
module.exports = app;
