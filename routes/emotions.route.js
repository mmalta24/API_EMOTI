const express = require("express");

const emotionController = require("../controllers/emotions.controller");
const authController = require("../controllers/auth.controller");

// express router
let router = express.Router();

router
  .route("/")
  .get(authController.verifyToken, emotionController.findAll)
  .post(authController.verifyToken, emotionController.create);

router
  .route("/:name")
  .delete(authController.verifyToken, emotionController.remove);

router.all("*", function (req, res) {
  res.status(404).json({ message: "Emotions: what???" });
});

module.exports = router;
