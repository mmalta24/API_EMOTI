const express = require("express");

const activitiesController = require("../controllers/activities.controller");
const authController = require("../controllers/auth.controller");

// express router
let router = express.Router();

router
  .route("/")
  .get(authController.verifyToken, activitiesController.findAll)
  .post(authController.verifyToken, activitiesController.create);
/*
router
  .route("/:activityName")
  .delete(authController.verifyToken, activitiesController.delete);
   */

router.all("*", function (req, res) {
  //send an predefined error message
  res.status(404).json({ message: "ACTIVITIES: what???" });
});

module.exports = router;
