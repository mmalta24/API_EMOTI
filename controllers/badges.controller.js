const db = require("../models");
const Badges = db.badges;

exports.create = async (req, res) => {
  if (req.typeUser !== "Administrador") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to create new badges!",
    });
  }

  const badge = new Badges({
    badgeName: req.body.badgeName,
    badgeIMG: req.body.badgeIMG,
    pointsNeeded: req.body.pointsNeeded,
    badgeEmotion: req.body.badgeEmotion,
  });
  try {
    // if save is successful, the returned promise will fulfill with the document saved
    await badge.save(); // save document in the badges DB collection
    return res.status(201).json({
      success: true,
      message: "New badge created.",
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
      return res.status(400).json({ success: false, messages: errors });
    }
    return res.status(500).json({
      success: false,
      message: err.message || "Some error occurred while creating the badge.",
    });
  }
};

// retrieve all badges / or find by title
exports.findAll = async (req, res) => {
  const emotion = req.query.emotion;
  const condition = emotion ? { badgeEmotion: emotion } : {};
  try {
    // find function parameters: filter, projection (select) / returns a list of documents
    let data = await Badges.find(condition).select("-_id").exec(); // execute the query
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Some error occurred while retrieving badges.",
    });
  }
};

// Delete a BADGE (given its id)
exports.delete = async (req, res) => {
  if (req.typeUser !== "Administrador") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to delete badges!",
    });
  }

  try {
    const badge = await Badges.findOneAndRemove({
      badgeName: req.params.badge,
    }).exec();
    if (!badge) {
      // returns the deleted document (if any) to the callback
      return res.status(404).json({
        success: false,
        error: `Badge with name ${req.params.badge} not found.`,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `Badge with name ${req.params.badge} was deleted successfully.`,
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: `Error deleting badge with name ${req.params.badge}.`,
    });
  }
};
