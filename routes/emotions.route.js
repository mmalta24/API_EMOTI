const express = require('express');

const emotionController = require("../controllers/emotions.controller");


let router = express.Router({ mergeParams: true });

router.use((req, res, next) => {
    const start = Date.now();
    //compare a start time to an end time and figure out how many seconds elapsed
    res.on("finish", () => { // the finish event is emitted once the response has been sent to the client
        const end = Date.now();
        const diffSeconds = (Date.now() - start) / 1000;
        console.log(`${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`);
    });
    next()
})

router.route('/')
    .get(emotionController.findAll)
    .post(emotionController.create)

router.route('/:name')
    .delete(emotionController.remove)

router.all('*', function (req, res) {
    res.status(404).json({ message: 'Emotions: what???' });
})

module.exports = router;