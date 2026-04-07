// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ✅ SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, department, class: cls, batch } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role,
      department,
      class: cls,
      batch
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        department: user.department,
        class: user.class,
        batch: user.batch
      },
      "SECRET"
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ msg: "Error signing up" });
  }
});

// ✅ LOGIN (you already used but not defined earlier)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email});
  if (!user) return res.status(400).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      department: user.department,
      class: user.class,
      batch: user.batch
    },
    "SECRET"
  );

  res.json({ token, user });
});

module.exports = router;