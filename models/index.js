const dbConfig = require("../config/db.config.js");
const mongoose = require("mongoose");

const db = {};

db.mongoose = mongoose;
db.url = dbConfig.URL;

console.log(db.url)
db.mongoose
  .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

db.users = require("./users.model.js")(mongoose);
db.badges = require("./badges.model.js")(mongoose);
module.exports = db;
