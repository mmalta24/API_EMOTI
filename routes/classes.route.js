const express = require('express');

const classesController = require("../controllers/classes.controller");

// express router
let router = express.Router();

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
    .get(classesController.findAll)
    .post(classesController.createClass);

router.route('/classRequests/:usernameChild')
    .get(classesController.findRequest)
    .post(classesController.createRequest)
    .put(classesController.acceptRequest)
    .delete(classesController.removeRequest)

router.route('/:className') 
    .delete(classesController.removeClass);

router.route('/children') 
    .get(classesController.findAllStudents)
    .delete(classesController.removeStudent)

router.route('/:className/children/:usernameChild')
    .put(classesController.alterStudentClass)
    


router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(404).json({ message: 'Classes: what???' });
})

module.exports = router;