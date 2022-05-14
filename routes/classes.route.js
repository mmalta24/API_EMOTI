const express = require("express");

const classesController = require("../controllers/classes.controller");

// express router
let router = express.Router();

router
  .route("/")
  .get(classesController.findAll)
  .post(classesController.createClass);

router.route("/requests").post(classesController.createRequest);

router
  .route("/requests/:usernameChild")
  .get(classesController.findRequest)
  .put(classesController.acceptRequest)
  .delete(classesController.removeRequest);

router
  .route("/children")
  .get(classesController.findAllStudents)
  .delete(classesController.removeStudent);

router.route("/:className").delete(classesController.removeClass);

router
  .route("/:className/children/:usernameChild")
  .put(classesController.alterStudentClass);

router.all("*", function (req, res) {
  res.status(404).json({ message: "CLASSES: what???" });
});

module.exports = router;
