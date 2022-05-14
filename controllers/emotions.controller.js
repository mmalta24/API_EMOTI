const db = require("../models");
const Emotion = db.emotions;

exports.create = async (req, res) => {
  const emotion = new Emotion({
    name: req.body.name,
  });
  try {
    // if save is successful, the returned promise will fulfill with the document saved
    await emotion.save(); // save document in the emotions DB collection
    res.status(201).json({
      success: true,
      message: "New emotion created.",
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
    res.status(500).json({
      success: false,
      message:
        err.message || "Some error occurred while creating the emotion. ",
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const emotions = await Emotion.find().select("-_id").exec();
    if (emotions === null)
      res.status(404).json({
        message: `Emotions not found.`,
      });
    else res.status(200).json({ success: true, emotions });
  } catch (err) {
    res.status(500).json({
      message: err.message || `Some error occurred while retrieving Emotions.`,
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const emotion = await Emotion.findOneAndRemove({
      name: req.params.name,
    }).exec();
    if (!emotion)
      // returns the deleted document (if any) to the callback
      res.status(404).json({
        success: false,
        message: `Emotion ${req.params.name} not found.`,
      });
    else
      res.status(200).json({
        success: true,
        message: `Emotion ${req.params.name} was deleted successfully.`,
      });
  } catch (err) {
    res.status(500).json({
      message: `Some error occurred while deleting emotion ${req.params.name}.`,
    });
  }
};
