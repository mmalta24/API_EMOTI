const jwt = require("jsonwebtoken"); //JWT tokens creation (sign())
const bcrypt = require("bcryptjs"); //password encryption
const config = require("../config/config.js");
const { cleanEmptyObjectKeys } = require("../helpers/index");
const db = require("../models/index");
const User = db.users;
const Activity = db.activities;
const Class = db.classes;

exports.login = async (req, res) => {
  try {
    if (!(req.body.username && req.body.password)) {
      return res
        .status(400)
        .json({ success: false, error: "Login with username and password!" });
    }
    const user = await User.findOne({
      username: req.body.username,
    }).exec();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found!",
      });
    }

    const check = bcrypt.compareSync(req.body.password, user.password);

    if (!check) {
      return res.status(401).json({
        success: false,
        error: "Username and password don't match!",
      });
    }

    if (user.blocked) {
      return res.status(403).json({
        success: false,
        error: "Your account is blocked. Please try again later!",
      });
    }

    const token = jwt.sign(
      { username: user.username, typeUser: user.typeUser },
      config.SECRET,
      {
        expiresIn: "24h",
      }
    );

    return res.status(200).json({
      success: true,
      authKey: token,
      typeUser: user.typeUser,
      username: user.username,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Some error occurred while loggin in!",
    });
  }
};

exports.create = async (req, res) => {
  // create instance of User
  const user = new User({
    username: req.body.username,
    password: req.body.password,
    name: req.body.name,
    email: req.body.email,
    typeUser: req.body.typeUser,
  });

  if (user.typeUser === "Administrador") {
    return res
      .status(400)
      .json({ success: false, error: "You can't register as an admin!" });
  }
  if (!user.password) {
    return res
      .status(400)
      .json({ success: false, error: "Please provide a password!" });
  }
  try {
    const encryptedPw = bcrypt.hashSync(user.password, 10);
    user.password = encryptedPw;
    await user.save(); // save User in the database
    return res.status(201).json({
      success: true,
      message: `User ${user.username} created!`,
      uri: `api/users/${user.username}`,
    });
  } catch (err) {
    if (err.name === "MongoServerError" && err.code === 11000) {
      return res.status(422).json({
        success: false,
        error: `The username ${req.body.username} or email ${req.body.email} are already in use!`,
      });
    } else if (err.name === "ValidationError") {
      let errors = [];
      Object.keys(err.errors).forEach((key) => {
        errors.push(err.errors[key].message);
      });
      return res.status(400).json({ success: false, error: errors });
    } else {
      return res.status(500).json({
        success: false,
        error: err.message || "Some error occurred while creating the user.",
      });
    }
  }
};

exports.findOne = async (req, res) => {
  if (req.username !== req.params.username) {
    return res.status(403).json({
      success: false,
      error: `You don't have permission to see ${req.params.username}'s data!`,
    });
  }
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("username email typeUser name imgProfile badgesId children -_id")
      .exec(); // clean unnecessary object keys for profile

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Some error occurred while getting information of user ${req.params.username}!`,
    });
  }
};

exports.update = async (req, res) => {
  try {
    if (
      req.username !== req.params.username &&
      req.typeUser !== "Administrador"
    ) {
      return res.status(403).json({
        success: false,
        error: `You don't have permission to edit ${req.params.username}'s data!`,
      });
    }

    // admin update
    if (
      req.typeUser === "Administrador" &&
      req.params.username !== req.username
    ) {
      if (!req.body.hasOwnProperty("blocked")) {
        return res.status(401).json({
          success: false,
          error: `As an admin, you only can update ${req.params.username} blocked status!`,
        });
      }

      const blockStatus = req.body.blocked;
      const user = await User.findOne({ username: req.params.username }).exec();

      if (user.typeUser === "Administrador") {
        return res.status(403).json({
          success: false,
          error: `Username ${req.params.username} cannot be blocked!`,
        });
      }

      if (blockStatus === user.blocked) {
        return res.status(400).json({
          success: false,
          error: blockStatus
            ? `User ${req.params.username} is already blocked!`
            : `User ${req.params.username} is already unblocked!`,
        });
      }

      await User.findOneAndUpdate(
        { username: req.params.username },
        { blocked: blockStatus },
        {
          returnOriginal: false, // to return the updated document
          runValidators: true, // update validators on update command
          useFindAndModify: false, //remove deprecation warning
        }
      ).exec();

      return res.status(200).json({
        success: true,
        message: `User ${req.params.username} updated!`,
        fieldsUpdated: {
          blocked: true,
          newValue: blockStatus,
        },
      });
    }

    // updating own profile
    if (req.username === req.params.username) {
      // check if user is trying to change their own blocked status
      if (req.body.hasOwnProperty("blocked")) {
        return res.status(401).json({
          success: false,
          error: "You don't have permission to change your own blocked status!",
        });
      }

      // check if user is updating nothing
      if (!req.body.password && !req.body.imgProfile) {
        return res.status(400).send({
          success: false,
          error: "Please provide provide password and/or imgProfile!",
        });
      }

      // clean props with empty string / not on body if any
      let items = cleanEmptyObjectKeys({
        password: req.body.password,
        imgProfile: req.body.imgProfile,
      });

      if (items.hasOwnProperty("password")) {
        const encryptedPw = bcrypt.hashSync(items.password, 10);
        items.password = encryptedPw;
      }

      // update user imgProfile and password
      await User.findOneAndUpdate(
        { username: req.params.username },

        items,
        {
          returnOriginal: false, // to return the updated document
          runValidators: true, // update validators on update command
          useFindAndModify: false, //remove deprecation warning
        }
      ).exec();

      return res.status(200).json({
        success: true,
        message: `User ${req.params.username} updated!`,
        fieldsUpdated: {
          password: items.hasOwnProperty("password"),
          imgProfile: items.hasOwnProperty("imgProfile"),
        },
      });
    }
  } catch (err) {
    if (err.name === "ValidationError") {
      let errors = [];
      Object.keys(err.errors).forEach((key) => {
        errors.push(err.errors[key].message);
      });
      return res.status(400).json({ success: false, error: errors });
    } else {
      return res.status(500).json({
        success: false,
        error: err.message || "Some error occurred while updating the user.",
      });
    }
  }
};

exports.findAll = async (req, res) => {
  if (req.typeUser !== "Administrador") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to see all application users!",
    });
  }

  let filter = cleanEmptyObjectKeys({
    username: req.query.username,
    typeUser: req.query.typeUser,
  });

  try {
    let users = await User.find(filter).select(
      "username email typeUser name imgProfile blocked -_id"
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "No users found with that filters!" });
    }
    return res.status(200).json({ success: true, users });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Some error occurred while retrieving users!",
    });
  }
};

exports.createAdmin = async (req, res) => {
  if (req.typeUser !== "Administrador") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to create admins!",
    });
  }

  const user = new User({
    username: req.body.username,
    password: req.body.password,
    name: req.body.name,
    email: req.body.email,
    typeUser: "Administrador",
  });

  try {
    const encryptedPw = bcrypt.hashSync(user.password, 10);
    user.password = encryptedPw;
    await user.save(); // save User in the database

    return res
      .status(200)
      .json({ success: true, message: `Admin ${user.username} created!` });
  } catch (err) {
    if (err.name === "MongoServerError" && err.code === 11000) {
      return res.status(422).json({
        success: false,
        error: `The username ${req.body.username} or email ${req.body.email} are already in use!`,
      });
    } else if (err.name === "ValidationError") {
      let errors = [];
      Object.keys(err.errors).forEach((key) => {
        errors.push(err.errors[key].message);
      });
      return res.status(400).json({ success: false, error: errors });
    }
    // missing password
    else if (err.message === "Illegal arguments: undefined, string") {
      return res
        .status(400)
        .json({ success: false, error: "Please provide a password!" });
    } else {
      return res.status(500).json({
        success: false,
        error: `Some error occurred while deleting user ${req.params.username}!`,
      });
    }
  }
};

exports.delete = async (req, res) => {
  if (req.typeUser !== "Administrador") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to delete users!",
    });
  }

  try {
    const user = await User.findOne({
      username: req.params.username,
    }).exec();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User ${req.params.username} not found!`,
      });
    }

    if (user.typeUser === "Administrador") {
      return res.status(400).json({
        success: false,
        message: `Admin ${user.username} can't be deleted!`,
      });
    }

    await User.findOneAndRemove({ username: user.username }).exec();

    // remove all from teacher
    if (user.typeUser === "Professor") {
      // activities
      await Activity.deleteMany({ author: user.username }).exec();
      // classes
      await Class.deleteMany({ teacher: user.username }).exec();
    }
    // remove all from tutor
    else if (user.typeUser === "Tutor") {
      // activities
      await Activity.deleteMany({ author: user.username }).exec();
      // classes
      await Class.updateMany(
        {},
        {
          $pull: {
            requests: { $in: user.children },
            students: { $in: user.children },
          },
        }
      ).exec();
      // users
      await User.updateMany(
        { tutor: user.username },
        {
          tutor: "",
          $pull: {
            activitiesSuggested: { $in: user.activitiesPersonalized },
          },
        }
      ).exec();
    }
    // remove all from child
    else {
      // classes
      await Class.updateMany(
        {},
        {
          $pull: {
            requests: { $in: user.username },
            students: { $in: user.username },
          },
        }
      ).exec();
      // users
      await User.updateOne(
        { username: user.tutor },
        { $pull: { children: user.username } }
      ).exec();
    }

    return res
      .status(200)
      .json({ success: true, message: `User ${user.username} deleted!` });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Some error occurred while deleting user ${req.params.username}!`,
    });
  }
};

exports.findRelations = async (req, res) => {
  // user validation
  if (req.typeUser !== "Tutor") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to see your relations!",
    });
  } else if (req.username !== req.params.username) {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to see that user's relations!",
    });
  }

  try {
    let tutor = await User.findOne({
      username: req.params.username,
    }).select("children -_id");

    let childrenInfo = await User.find({ username: { $in: tutor.children } });

    return res.status(200).json({ success: true, children: childrenInfo });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Some error occurred while associating to child ${req.body.usernameChild}!`,
    });
  }
};

exports.createRelation = async (req, res) => {
  // data validation
  if (req.typeUser !== "Tutor") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to create a relation!",
    });
  } else if (req.username !== req.params.username) {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to create a relation on that user!",
    });
  }
  if (!req.body.usernameChild || !req.body.password) {
    return res.status(400).json({
      success: false,
      error: "Please provide usernameChild and password!",
    });
  }

  try {
    // finding child
    const childUser = await User.findOne({
      username: req.body.usernameChild,
    }).exec();
    if (!childUser) {
      return res.status(404).json({
        success: false,
        error: `Child ${req.body.usernameChild} not found!`,
      });
    } else if (childUser.typeUser !== "Criança") {
      return res.status(400).json({
        success: false,
        error: `User ${req.body.usernameChild} is not a child!`,
      });
    }
    // validate relations
    const tutorUser = await User.findOne({
      username: req.params.username,
    }).exec();
    if (tutorUser.children.includes(req.body.usernameChild)) {
      return res.status(400).json({
        success: false,
        error: `Already related to ${req.body.usernameChild}!`,
      });
    } else if (childUser.tutor) {
      return res.status(400).json({
        success: false,
        error: `Child ${req.body.usernameChild} already has a tutor!`,
      });
    }
    // validate child password
    const check = bcrypt.compareSync(req.body.password, childUser.password);
    if (!check) {
      return res.status(400).json({
        success: false,
        error: `Child password is wrong!`,
      });
    }

    // update tutor and child
    await User.findOneAndUpdate(
      { username: req.params.username },
      { $push: { children: req.body.usernameChild } },
      {
        returnOriginal: false, // to return the updated document
        runValidators: false, //runs update validators on update command
        useFindAndModify: false, //remove deprecation warning
      }
    ).exec();

    await User.findOneAndUpdate(
      { username: req.body.usernameChild },
      { tutor: req.params.username },
      {
        returnOriginal: false, // to return the updated document
        runValidators: false, //runs update validators on update command
        useFindAndModify: false, //remove deprecation warning
      }
    ).exec();

    return res.status(200).json({
      success: true,
      message: `Relation between ${req.params.username} and ${req.body.usernameChild} created!`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Some error occurred while associating to child ${req.body.usernameChild}!`,
    });
  }
};

exports.removeRelation = async (req, res) => {
  // data validation
  if (req.typeUser !== "Tutor") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to undo a relation!",
    });
  } else if (req.username !== req.params.username) {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to undo a relation on that user!",
    });
  } else if (!req.body.usernameChild) {
    return res
      .status(400)
      .json({ success: false, error: "Please provide usernameChild!" });
  }

  try {
    const tutorUser = await User.findOne({
      username: req.params.username,
    }).exec();

    if (!tutorUser.children.includes(req.body.usernameChild)) {
      return res.status(404).json({
        success: false,
        error: `Child ${req.body.usernameChild} not found on your relations!`,
      });
    }

    // update tutor and child
    await User.findOneAndUpdate(
      { username: req.params.username },
      { $pull: { children: req.body.usernameChild } },
      {
        returnOriginal: false, // to return the updated document
        runValidators: false, //runs update validators on update command
        useFindAndModify: false, //remove deprecation warning
      }
    ).exec();

    await User.findOneAndUpdate(
      { username: req.body.usernameChild },
      { tutor: "" },
      {
        returnOriginal: false, // to return the updated document
        runValidators: false, //runs update validators on update command
        useFindAndModify: false, //remove deprecation warning
      }
    ).exec();

    return res.status(200).json({
      success: true,
      message: `Relation between ${req.params.username} and ${req.body.usernameChild} undone!`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Some error occurred while disassociating to child ${req.body.usernameChild}!`,
    });
  }
};

const dateString = () => {
  let newDate = new Date();
  let day = String(newDate.getDate());
  let month = String(newDate.getMonth() + 1);
  let year = newDate.getFullYear();
  return day + "/" + month + "/" + year;
};

exports.addHistory = async (req, res) => {
  if (req.typeUser !== "Criança") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to add to history!",
    });
  }
  if (!req.body.title || !req.body.results || !req.body.pointsEarned) {
    return res.status(400).json({
      success: false,
      error: "Please provide title, results and pointsEarned!",
    });
  }

  const item = {
    date: dateString(),
    title: req.body.title,
    results: req.body.results,
    pointsEarned: req.body.pointsEarned,
  };

  const activity = await Activity.findOne({ title: item.title }).exec();

  if (!activity) {
    return res.status(404).json({
      success: false,
      error: `Activity ${item.title} not found!`,
    });
  }

  await User.findOneAndUpdate(
    { username: req.username },
    { $push: { history: item } },
    {
      returnOriginal: false, // to return the updated document
      runValidators: false, //runs update validators on update command
      useFindAndModify: false, //remove deprecation warning
    }
  );

  return res
    .status(200)
    .json({ success: true, message: "Activity added to history!", item });
};

exports.getHistory = async (req, res) => {
  if (req.typeUser !== "Tutor") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to see children's history!",
    });
  }

  const tutorChildren = await User.findOne({ username: req.username })
    .select("children -_id")
    .exec();

  const children = await User.find({
    username: { $in: tutorChildren.children },
  })
    .select("username history -_id")
    .exec();

  let history = [];

  for (const child of children) {
    for (const item of child.history) {
      history.push({ username: child.username, ...item });
    }
  }

  return res.status(200).json({ success: true, history });
};
