require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT;
const host = process.env.HOST;

app.use(cors());
app.use(express.json());

app.use("/api", require("./routes/index.route"));

//app.use("/api/users", require("./routes/users.route.js"));

// handle invalid routes
app.get("*", function (req, res) {
  res.status(404).json({ message: "WHAT???" });
});
app.listen(port, () => console.log(`App listening at http://${host}:${port}/`));
