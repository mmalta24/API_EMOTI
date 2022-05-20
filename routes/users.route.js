const express = require("express");
const usersController = require("../controllers/users.controller");
const authController = require("../controllers/auth.controller");

// express router
let router = express.Router();

router
  .route("/")
  .get(authController.verifyToken, usersController.findAll)
  .post(usersController.create);

router.route("/login").post(usersController.login);

router
  .route("/:username")
  .get(usersController.findOne)
  .patch(usersController.update)
  .delete(usersController.delete);

router
  .route("/:username/children")
  .get(usersController.findRelations)
  .put(usersController.createRelation)
  .delete(usersController.removeRelation);

router
  .route("/:username/history")
  .get(usersController.getHistory)
  .post(usersController.addHistory);

router.all("*", function (req, res) {
  return res.status(404).json({ message: "USERS: what???" });
});

module.exports = router;
