const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors({ origin: true }));
const port = process.env.PORT || 1122;
// const fs = require("fs");
const path = require("path");
app.use(express.static(path.join(__dirname, "build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port);
