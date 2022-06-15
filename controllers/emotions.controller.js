const db = require("../models");
const Emotion = db.emotions;
const Badge = db.badges;

exports.create = async (req, res) => {
  if (req.typeUser !== "Administrador") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to add new emotions!",
    });
  }
  const emotion = new Emotion({
    name: req.body.name,
  });
  try {
    await emotion.save(); // save document in the emotions DB collection
    res.status(201).json({
      success: true,
      message: "New emotion created!",
      URL: `/emotions/${emotion.name}`,
    });
  } catch (err) {
    if (err.name === "MongoServerError" && err.code === 11000) {
      return res.status(422).json({
        success: false,
        error: `The emotion with name ${emotion.name} already exists!`,
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
      message: err.message || "Some error occurred while creating the emotion.",
    });
  }
};

exports.findAll = async (req, res) => {
  if (req.typeUser === "Criança") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to see emotions!",
    });
  }
  try {
    const emotions = await Emotion.find().select("-_id").exec();

    return res.status(200).json({ success: true, emotions });
  } catch (err) {
    res.status(500).json({
      message: err.message || `Some error occurred while retrieving Emotions.`,
    });
  }
};

exports.remove = async (req, res) => {
  if (req.typeUser !== "Administrador") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to remove emotions!",
    });
  }
  try {
    const emotion = await Emotion.findOneAndRemove({
      name: req.params.name,
    }).exec();
    if (!emotion) {
      return res.status(404).json({
        success: false,
        message: `Emotion ${req.params.name} not found!`,
      });
    }

    await Badge.deleteMany({ badgeEmotion: req.params.name }).exec();

    return res.status(200).json({
      success: true,
      message: `Emotion ${req.params.name} was deleted successfully!`,
    });
  } catch (err) {
    res.status(500).json({
      message: `Some error occurred while deleting emotion ${req.params.name}.`,
    });
  }
};
