// routes/notices.js
const express = require("express");
const Notice = require("../models/Notice");
const { canView } = require("../utils/filterNotes.js");

const router = express.Router();

router.get("/", async (req, res) => {
  const notices = await Notice.find().sort({ createdAt: -1 });

  const filtered = notices.filter(n => canView(n, req.user));

  res.json(filtered);
});

// routes/notices.js

router.post("/", async (req, res) => {
  if (!req.user) {
    return res.status(403).json({ msg: "Unauthorized" });
  }

  const { title, content, visibility } = req.body;

  // 🧠 ADMIN → full control
  if (req.user.role === "admin") {
    const notice = new Notice({ title, content, visibility });
    await notice.save();
    return res.json(notice);
  }

  // 🧠 FACULTY → restricted
  if (req.user.role === "faculty") {
    // ❌ Cannot create admin notices
    if (visibility.role === "admin") {
      return res.status(403).json({ msg: "Not allowed" });
    }

    // ❌ Cannot create for other departments
    if (visibility.department !== req.user.department) {
      return res.status(403).json({ msg: "Wrong department" });
    }

    // ✅ Only student-level notices allowed
    if (visibility.role !== "student") {
      return res.status(403).json({ msg: "Faculty can only create student notices" });
    }

    const notice = new Notice({
      title,
      content,
      visibility: {
        role: "student",
        department: req.user.department,
        class: visibility.class,
        batch: visibility.batch
      }
    });

    await notice.save();
    return res.json(notice);
  }

  // ❌ STUDENT → no permission
  return res.status(403).json({ msg: "Students cannot create notices" });
});

module.exports = router