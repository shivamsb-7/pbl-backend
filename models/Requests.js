const mongoose = require("mongoose");

const RequestsSchema = new mongoose.Schema(
  {

    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },

    // store hashed password
    password: { type: String, required: true },

    role: { type: String, enum: ["student", "faculty", "admin"], required: true },
    department: { type: String, required: true },

    class: { type: String, required: true },
    batch: { type: String, required: true },

    status: { type: String, enum: ["pending", "accept", "reject"], default: "pending" }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // adds createdAt like your example
  }
);

module.exports = mongoose.model("Requests", RequestsSchema);