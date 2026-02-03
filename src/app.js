const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const registrationsRoutes = require("./routes/submissions.routes");
const announcementsRoutes = require("./routes/announcements.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ ok: true }));

// 🔹 Register
app.use("/api/registrations", registrationsRoutes);

// 🔹 Announcements
app.use("/api/announcements", announcementsRoutes);

app.use(errorHandler);

module.exports = app;
