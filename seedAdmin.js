// seedAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function createAdmin() {
  await mongoose.connect(process.env.CONN);

  const existing = await User.findOne({ email: "admin@college.com" });
  if (existing) {
    console.log("Admin already exists");
    return process.exit();
  }

  const hashed = await bcrypt.hash("admin123", 10);

  const admin = new User({
    name: "Admin",
    email: "admin@college.com",
    password: hashed,
    role: "admin"
  });

  await admin.save();
  console.log("Admin created");
  process.exit();
}

createAdmin();