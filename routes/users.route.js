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
  .route("/addAdmin")
  .post(authController.verifyToken, usersController.createAdmin);

router
  .route("/:username")
  .get(authController.verifyToken, usersController.findOne)
  .patch(authController.verifyToken, usersController.update)
  .delete(authController.verifyToken, usersController.delete);

/*
router
  .route("/:username/children")
  .get(authController.verifyToken, usersController.findRelations)
  .put(authController.verifyToken, usersController.createRelation)
  .delete(authController.verifyToken, usersController.removeRelation);

router
  .route("/:username/history")
  .get(authController.verifyToken, usersController.getHistory)
  .post(authController.verifyToken, usersController.addHistory);
   */

router.all("*", function (req, res) {
  return res.status(404).json({ message: "USERS: what???" });
});

module.exports = router;
