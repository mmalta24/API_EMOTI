const express = require("express");

const badgesController = require("../controllers/badges.controller");

// express router
let router = express.Router();

router.route("/").get(badgesController.findAll).post(badgesController.create);

router.route("/:badge").delete(badgesController.delete);

router.all("*", function (req, res) {
  //send an predefined error message
  res.status(404).json({ message: "BADGES: what???" });
});

module.exports = router;
