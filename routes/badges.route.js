const express = require("express");

const badgesController = require("../controllers/badges.controller");
const authController = require("../controllers/auth.controller");

// express router
let router = express.Router();

router
  .route("/")
  .get(authController.verifyToken, badgesController.findAll)
  .post(authController.verifyToken, badgesController.create);

router
  .route("/:badge")
  .delete(authController.verifyToken, badgesController.delete);

router.all("*", function (req, res) {
  res.status(404).json({ message: "BADGES: what???" });
});

module.exports = router;
