const express = require('express');

const emotionController = require("../controllers/emotions.controller");


let router = express.Router({ mergeParams: true });

router.route('/')
    .get(emotionController.findAll)
    .post(emotionController.create)
    .delete(emotionController.remove)

router.all('*', function (req, res) {
    res.status(404).json({ message: 'Emotions: what???' });
})

module.exports = router;