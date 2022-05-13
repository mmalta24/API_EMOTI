const express = require('express');

const usersRoute = require("../routes/users.route");
const badgesRoute = require("../routes/badges.route");
const activitiesRoute=require("../routes/activities.route")
const emotionsRoute=require("../routes/emotions.route")

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



router.use('/users',usersRoute)
      .use('/badges',badgesRoute)
      .use('/activities',activitiesRoute)
      .use('/emotions',emotionsRoute);



router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(404).json({ message: 'INDEX: what???' });
})

module.exports = router;