// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const auth = require("./middleware/auth");
require("dotenv").config()
const app = express();


app.use(cors());
app.use(express.json());
app.use(auth);

mongoose.connect(process.env.CONN);

app.use("/notices", require("./routes/notices"));
app.use("/auth", require("./routes/auth"));

app.listen(5000, () => console.log("Server running"));