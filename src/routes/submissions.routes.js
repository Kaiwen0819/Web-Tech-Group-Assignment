// server/src/routes/submissions.routes.js
const express = require("express");
const { db, admin } = require("../firebaseAdmin");
const router = express.Router();

// ✅ register 存在 registrations collection
const col = db.collection("registrations");

// ✅ 把名字变成可当 Firestore doc id 的格式（不乱码、不空格）
function slugifyName(fullName) {
  return String(fullName)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")       // 空格 -> -
    .replace(/[^a-z0-9\-]/g, ""); // 只保留 a-z 0-9 -
}

router.post("/", async (req, res, next) => {
  try {
    const { fullName, email, phone } = req.body;

    if (!fullName || String(fullName).trim() === "") {
      return res.status(400).json({ error: "fullName is required" });
    }

    const baseId = slugifyName(fullName);
    if (!baseId) {
      return res.status(400).json({ error: "Invalid fullName" });
    }

    // ✅ 如果同名，自动加尾巴避免冲突（例如 ali-test-1700000000000）
    let docId = baseId;
    const existing = await col.doc(docId).get();
    if (existing.exists) {
      docId = `${baseId}-${Date.now()}`;
    }

    await col.doc(docId).set({
      fullName,
      email: email || "",
      phone: phone || "",
      status: "new",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: docId });
  } catch (e) {
    next(e);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const snap = await col.get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { next(e); }
});

module.exports = router;
