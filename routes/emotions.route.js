const express = require("express");

const emotionController = require("../controllers/emotions.controller");

// express router
let router = express.Router();

router.route("/").get(emotionController.findAll).post(emotionController.create);

router.route("/:name").delete(emotionController.remove);

router.all("*", function (req, res) {
  res.status(404).json({ message: "Emotions: what???" });
});

module.exports = router;
