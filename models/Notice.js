// models/Notice.js
const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now },

  visibility: {
    role: {
      type: String,
      enum: ["public", "student", "faculty", "admin"]
    },
    department: String,
    class: String,
    batch: String
  }
});

module.exports = mongoose.model("Notice", noticeSchema);