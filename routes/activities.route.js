const express = require("express");

const activitiesController = require("../controllers/activities.controller");
const authController = require("../controllers/auth.controller");

// express router
let router = express.Router();

router
  .route("/")
  .get(authController.verifyToken, activitiesController.findAll)
  .post(authController.verifyToken, activitiesController.create);

router
  .route("/:activityName")
  .patch(authController.verifyToken, activitiesController.update)
  .delete(authController.verifyToken, activitiesController.delete);

router
  .route("/:activityName/children")
  .post(authController.verifyToken, activitiesController.giveActivity);

router.all("*", function (req, res) {
  res.status(404).json({ message: "ACTIVITIES: what???" });
});

module.exports = router;
