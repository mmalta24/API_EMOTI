const jwt = require("jsonwebtoken"); //JWT tokens creation (sign())
const bcrypt = require("bcryptjs"); //password encryption
const config = require("../config/config.js");
const { cleanEmptyObjectKeys } = require("../helpers/index");
const db = require("../models/index");
const User = db.users;

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

    const check = bcrypt.compareSync(req.body.password, user.password);

    if (user === null || !check) {
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

    return res.status(200).json({ success: true, authKey: token });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Some error occurred while loggin in!",
    });
  }
};

exports.create = async (req, res) => {
  const encryptedPw = bcrypt.hashSync(req.body.password, 10);
  // create instance of User
  const user = new User({
    username: req.body.username,
    password: encryptedPw,
    name: req.body.name,
    email: req.body.email,
    typeUser: req.body.typeUser,
  });

  try {
    await user.save(); // save User in the database
    return res
      .status(201)
      .json({ success: true, uri: `api/users/${user.username}` });
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
      .select("username password email typeUser name imgProfile -_id")
      .exec(); // clean unnecessary object keys for profile
    if (user === null) {
      return res.status(404).json({
        success: false,
        error: `Username ${req.params.username} not found!`,
      });
    }
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
  const validationHasFields =
    req.body.password ||
    req.body.imgProfile ||
    req.body.blocked === true ||
    req.body.blocked === false;
  const validationHasBothCases =
    (req.body.password || req.body.imgProfile) &&
    (req.body.blocked === true || req.body.blocked === false);
  // if no valid fields to update OR has both cases (profile and admin block)
  if (!validationHasFields || validationHasBothCases) {
    return res.status(400).send({
      success: false,
      error: "Please provide provide password and/or imgProfile or blocked!",
    });
  }

  try {
    let items =
      req.body.blocked === true || req.body.blocked === false
        ? { blocked: req.body.blocked }
        : cleanEmptyObjectKeys({
            password: req.body.password,
            imgProfile: req.body.imgProfile,
          });

    // password and/or imgProfile case
    if (items.password || items.imgProfile) {
      const user = await User.findOneAndUpdate(
        { username: req.params.username },
        items,
        {
          returnOriginal: false, // to return the updated document
          runValidators: true, //runs update validators on update command
          useFindAndModify: false, //remove deprecation warning
        }
      ).exec();

      if (user === null) {
        return res.status(404).json({
          success: false,
          error: `Username ${req.params.username} not found!`,
        });
      }
      return res.status(200).json({
        success: true,
        message: `User ${req.params.username} updated!`,
        fieldsUpdated: {
          password: Boolean(items.password),
          imgProfile: Boolean(items.imgProfile),
        },
      });
    }
    // block user
    else {
      const user = await User.findOne({ username: req.params.username }).exec();
      if (user === null) {
        return res.status(404).json({
          success: false,
          error: `Username ${req.params.username} not found!`,
        });
      } else if (user.typeUser === "Administrador") {
        return res.status(403).json({
          success: false,
          error: `Username ${req.params.username} cannot be blocked!`,
        });
      } else if (user.blocked === items.blocked) {
        return res.status(400).json({
          success: false,
          error: items.blocked
            ? `Username ${req.params.username} is already blocked`
            : `Username ${req.params.username} is already unblocked`,
        });
      }

      await User.updateOne({ username: req.params.username }, items, {
        returnOriginal: false, // to return the updated document
        runValidators: true, //runs update validators on update command
        useFindAndModify: false, //remove deprecation warning
      }).exec();
      return res.status(200).json({
        success: true,
        message: `User ${req.params.username} updated!`,
        fieldsUpdated: {
          blocked: true,
          newValue: items.blocked,
        },
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Some error occurred while updating information of user ${req.params.username}!`,
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    let items = {
      username: req.query.username,
      typeUser: req.query.typeUser,
    };

    let newItems = cleanEmptyObjectKeys(items);

    let users = await User.find(newItems).select(
      "username password email typeUser name imgProfile blocked -_id"
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

exports.delete = async (req, res) => {
  try {
    const user = await User.findOneAndRemove({
      username: req.params.username,
    }).exec();
    if (user === null) {
      return res.status(404).json({
        success: false,
        error: `Username ${req.params.username} not found!`,
      });
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

exports.createRelation = async (req, res) => {
  if (!req.body.usernameChild) {
    return res
      .status(400)
      .json({ success: false, error: "Please provide usernameChild!" });
  }
  try {
    const tutorUser = await User.findOne({
      username: req.params.username,
      typeUser: "Tutor",
    }).exec();
    const childUser = await User.findOne({
      username: req.body.usernameChild,
      typeUser: "Criança",
    }).exec();

    if (tutorUser === null || childUser === null) {
      return res.status(404).json({
        success: false,
        error:
          tutorUser === null
            ? `Tutor ${req.params.username} not found!`
            : `Child ${req.body.usernameChild} not found!`,
      });
    }

    if (tutorUser.children.includes(req.body.usernameChild)) {
      return res.status(400).json({
        success: false,
        error: `Already related to ${req.body.usernameChild}!`,
      });
    }
    if (childUser.tutor) {
      return res.status(400).json({
        success: false,
        error: `Child ${req.body.usernameChild} already has a tutor!`,
      });
    }
    // update tutor
    await User.findOneAndUpdate(
      { username: req.params.username },
      { $push: { children: req.body.usernameChild } },
      {
        returnOriginal: false, // to return the updated document
        runValidators: true, //runs update validators on update command
        useFindAndModify: false, //remove deprecation warning
      }
    ).exec();

    // update child
    await User.findOneAndUpdate(
      { username: req.body.usernameChild },
      { tutor: req.params.username },
      {
        returnOriginal: false, // to return the updated document
        runValidators: true, //runs update validators on update command
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

exports.removeRelation = (req, res) => {
  return res.status(200).json({ success: true, message: "OK" });
};

exports.findRelations = (req, res) => {
  return res.status(200).json({ success: true, message: "OK" });
};

exports.addHistory = (req, res) => {
  return res.status(200).json({ success: true, message: "OK" });
};

exports.getHistory = (req, res) => {
  return res.status(200).json({ success: true, message: "OK" });
};
