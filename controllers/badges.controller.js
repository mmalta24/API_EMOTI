const { cleanEmptyObjectKeys } = require("../helpers");
const db = require("../models");
const Badge = db.badges;
const Emotion = db.emotions;

exports.create = async (req, res) => {
  if (req.typeUser !== "Administrador") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to create new badges!",
    });
  }

  const badge = new Badge({
    badgeName: req.body.badgeName,
    badgeIMG: req.body.badgeIMG,
    pointsNeeded: req.body.pointsNeeded,
    badgeEmotion: req.body.badgeEmotion,
  });
  try {
    const emotion = await Emotion.findOne({ name: badge.badgeEmotion }).exec();
    if (!emotion) {
      return res.status(404).json({
        success: false,
        error: `Emotion ${badge.badgeEmotion} not found!`,
      });
    }
    await badge.save(); // save document in the badges DB collection
    return res.status(201).json({
      success: true,
      message: "New badge created!",
      URL: `/badges/${badge.badgeName}`,
    });
  } catch (err) {
    // capture mongoose validation errors
    if (err.name === "MongoServerError" && err.code === 11000) {
      return res.status(422).json({
        success: false,
        error: `The badge with name ${badge.badgeName} already exists!`,
      });
    } else if (err.name === "ValidationError") {
      let errors = [];
      Object.keys(err.errors).forEach((key) => {
        errors.push(err.errors[key].message);
      });
      return res.status(400).json({ success: false, error: errors });
    }
    return res.status(500).json({
      success: false,
      message: err.message || "Some error occurred while creating the badge.",
    });
  }
};

exports.findAll = async (req, res) => {
  if (req.typeUser !== "Administrador") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to see all badges!",
    });
  }

  const emotion = req.query.emotion;
  const title = req.query.title;
  const filters = cleanEmptyObjectKeys({
    badgeEmotion: emotion,
    badgeName: title,
  });

  try {
    let badges = await Badge.find(filters).select("-_id").exec(); // execute the query
    return res.status(200).json({ success: true, badges });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Some error occurred while retrieving badges.",
    });
  }
};

exports.delete = async (req, res) => {
  if (req.typeUser !== "Administrador") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to delete badges!",
    });
  }

  try {
    const badge = await Badge.findOneAndRemove({
      badgeName: req.params.badge,
    }).exec();
    if (!badge) {
      return res.status(404).json({
        success: false,
        error: `Badge with name ${req.params.badge} not found!`,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `Badge with name ${req.params.badge} was deleted successfully!`,
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: `Some error occurred while deleting badge with name ${req.params.badge}.`,
    });
  }
};
