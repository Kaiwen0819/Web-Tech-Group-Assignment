const express = require("express");
const { db, admin } = require("../firebaseAdmin");
const router = express.Router();

function slugify(text = "") {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-");
}

const col = db.collection("announcements");
const counterRef = db.collection("meta").doc("announcementsCounter");

/**
 * POST /api/announcements
 * body: { title, category, content, eventDate, isUrgent }
 */
router.post("/", async (req, res, next) => {
  try {
    const { title, category, content, eventDate, isUrgent } = req.body;

    if (!title || !category || !content || !eventDate) {
      return res.status(400).json({
        error: "title, category, content, eventDate are required",
      });
    }

    let newSeq = 0;

    // 🔥 Transaction 保证 seq 不会重复
    await db.runTransaction(async (tx) => {
      const counterSnap = await tx.get(counterRef);

      if (!counterSnap.exists) {
        newSeq = 1;
        tx.set(counterRef, { current: 1 });
      } else {
        newSeq = counterSnap.data().current + 1;
        tx.update(counterRef, { current: newSeq });
      }

      const docId = String(newSeq);

      tx.set(col.doc(docId), {
        seq: newSeq,
        title,
        category,
        content,
        eventDate,              // YYYY-MM-DD
        isUrgent: !!isUrgent,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return res.status(201).json({ id: newSeq });
  } catch (e) {
    next(e);
  }
});


router.get("/", async (req, res, next) => {
  try {
    const snap = await col.orderBy("seq", "desc").get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) {
    next(e);
  }
});

// DELETE /api/announcements/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Announcement id is required" });
    }

    const ref = db.collection("announcements").doc(id);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    await ref.delete();

    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /announcements error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /api/announcements/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, content, eventDate, isUrgent } = req.body;

    if (!title || !category || !content || !eventDate) {
      return res.status(400).json({ error: "title, category, content, eventDate are required" });
    }

    await db.collection("announcements").doc(id).update({
      title,
      category,
      content,
      eventDate,
      isUrgent: !!isUrgent,
      updatedAt: new Date().toISOString(),
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("PUT /announcements/:id error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

 

module.exports = router;