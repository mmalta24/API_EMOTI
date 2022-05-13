require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT;
const host = process.env.HOST;

app.use(cors());
app.use(express.json());

app.get("/api", function (req, res) {
  res.status(200).json({ message: "EMOTI API" });
});

// handle invalid routes
app.get("*", function (req, res) {
  res.status(404).json({ message: "WHAT???" });
});
app.listen(port, host, () =>
  console.log(`App listening at http://${host}:${port}/`)
);
