const express = require("express");

const activitiesController = require("../controllers/activities.controller");

// express router
let router = express.Router();

router
  .route("/")
  .get(activitiesController.findAll)
  .post(activitiesController.create);

router.route("/:activityName").delete(activitiesController.delete);

router.all("*", function (req, res) {
  //send an predefined error message
  res.status(404).json({ message: "ACTIVITIES: what???" });
});

module.exports = router;
