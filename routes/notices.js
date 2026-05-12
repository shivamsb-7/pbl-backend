const express = require("express");
const axios = require("axios");
require("dotenv").config()
const Notice = require("../models/Notice");
const { canView } = require("../utils/filterNotes.js");

const router = express.Router();

router.post("/", async (req, res) => {
  if (!req.user) {
    return res.status(403).json({ msg: "Unauthorized" });
  }

  const { title, content, visibility, expiryDate } = req.body;

  let summary = "";

  // ✅ Generate summary ONLY for general notices
  if (visibility.role === "general") {
    try {
      const response = await axios.post(
        "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
        {
          inputs: content
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`
          }
        }
      );

      summary = response.data[0]?.summary_text || "";
    } catch (err) {
      console.error("Summary API failed:", err.message);
    }
  }

  // 🧠 ADMIN
  if (req.user.role === "admin") {
    const notice = new Notice({
      title,
      content,
      visibility,
      expiryDate,
      summary
    });

    await notice.save();
    return res.json(notice);
  }

  // 🧠 FACULTY
  if (req.user.role === "faculty") {
    if (visibility.role === "admin") {
      return res.status(403).json({ msg: "Not allowed" });
    }

    if (visibility.department !== req.user.department) {
      return res.status(403).json({ msg: "Wrong department" });
    }

    if (
      visibility.role !== "student" &&
      visibility.role !== "general"
    ) {
      return res.status(403).json({
        msg: "Faculty can only create student/general notices"
      });
    }

    const notice = new Notice({
      title,
      content,
      visibility: {
        role: visibility.role,
        department: req.user.department,
        class: visibility.class,
        batch: visibility.batch
      },
      expiryDate,
      summary
    });

    await notice.save();
    return res.json(notice);
  }

  return res.status(403).json({ msg: "Students cannot create notices" });
});
  
  router.get("/", async (req, res) => {
    const notices = await Notice.find().sort({ createdAt: -1 });
  
    const filtered = notices.filter(n => canView(n, req.user));
  
    res.json(filtered);
  });
  
  router.post("/delete", async (req, res) => {
    if (!req.user) {
    return res.status(403).json({ msg: "Unauthorized" });
  }

  const { noticeId } = req.body;

  try {
    const notice = await Notice.findById(noticeId);

    if (!notice) {
      return res.status(404).json({ msg: "Notice not found" });
    }

    // ✅ ADMIN can delete anything
    if (req.user.role === "admin") {
      await Notice.findByIdAndDelete(noticeId);
      return res.json({ msg: "Notice deleted" });
    }

    // ✅ FACULTY restrictions
    if (req.user.role === "faculty") {
      // faculty can only delete notices from their own department
      if (
        notice.visibility.department !== req.user.department ||
        notice.visibility.role === "admin"
      ) {
        return res.status(403).json({ msg: "Not allowed" });
      }

      await Notice.findByIdAndDelete(noticeId);
      return res.json({ msg: "Notice deleted" });
    }

    // ❌ students cannot delete
    return res.status(403).json({ msg: "Students cannot delete notices" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router