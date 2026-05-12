const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  title: String,
  content: String,
summary: {
  type: String,
  default: ""
},
  createdAt: { type: Date, default: Date.now },
  expiryDate: { type: Date, default: null },

  visibility: {
    role: {
      type: String,
      enum: ["public", "student", "faculty", "admin", "general"]
    },
    department: String,
    class: String,
    batch: String,
    
  }
});

module.exports = mongoose.model("Notice", noticeSchema);