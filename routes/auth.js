const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Requests = require("../models/Requests");
const router = express.Router();

// ✅ SIGNUP (creates a pending request)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, department, class: cls, batch } = req.body;

    // already a user?
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    // already requested?
    const existingRequest = await Requests.findOne({ email });
    if (existingRequest) return res.status(400).json({ msg: "Signup request already submitted" });

    // hash and store in request
    const hashed = await bcrypt.hash(password, 10);

    const request = new Requests({
      name,
      email,
      password: hashed,
      role,
      department,
      class: cls,
      batch,
      status: "pending"
    });

    await request.save();

    res.json({ msg: "Signup request submitted", request });
  } catch (err) {
    res.status(500).json({ msg: "Error signing up" });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
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
  } catch (err) {
    res.status(500).json({ msg: "Error logging in" });
  }
});

// ✅ GET ALL REQUESTS
router.get("/requests", async (req, res) => {
  try {
    const requests = await Requests.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching requests" });
  }
});

// ✅ HANDLE REQUEST (ACCEPT / REJECT)
// body: { requestId, action }
router.post("/requests", async (req, res) => {
  try {
    const { requestId, action } = req.body;

    if (!requestId || !action) {
      return res.status(400).json({ msg: "requestId and action are required" });
    }

    const request = await Requests.findById(requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });
    console.log(action)
    if (action === "accept") {
      // avoid duplicates
      const existingUser = await User.findOne({ email: request.email });
      if (existingUser) {
        await Requests.findByIdAndDelete(requestId);
        return res.status(400).json({ msg: "User already exists; request removed" });
      }

      const user = new User({
        name: request.name,
        email: request.email,
        password: request.password, // already hashed
        role: request.role,
        department: request.department,
        class: request.class,
        batch: request.batch
      });

      await user.save();
      await Requests.findByIdAndDelete(requestId);

      return res.json({ msg: "Request accepted", user });
    }

    // reject (or anything else): just remove
    await Requests.findByIdAndDelete(requestId);
    return res.json({ msg: "Request rejected/removed" });
  } catch (err) {
    res.status(500).json({ msg: "Error processing request" });
  }
});

module.exports = router;