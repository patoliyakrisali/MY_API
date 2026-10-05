const express = require("express");
const authRoutes = require("./routes/auth.routes");
const passwordRoutes = require("./routes/password.routes");
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/auth", passwordRoutes);

module.exports = app;