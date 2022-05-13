const express = require("express");
const usersController = require("../controllers/users.controller");

let router = express.Router();

router.use((req, res, next) => {
  const start = Date.now();
  //compare a start time to an end time and figure out how many seconds elapsed
  res.on("finish", () => {
    // the finish event is emitted once the response has been sent to the client
    const end = Date.now();
    const diffSeconds = (Date.now() - start) / 1000;
    console.log(
      `${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`
    );
  });
  next();
});

router.route("/login").post(usersController.login);

router.route("/").post(usersController.create).get(usersController.findAll);

router
  .route("/:username")
  .get(usersController.find)
  .patch(usersController.edit)
  .delete(usersController.remove);

router
  .route("/:username/children")
  .put(usersController.createRelation)
  .delete(usersController.removeRelation)
  .get(usersController.findRelations);

router.all("*", function (req, res) {
  return res.status(404).json({ message: "USERS: what???" });
});

module.exports = router;
