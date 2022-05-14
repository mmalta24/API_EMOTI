const { cleanEmptyObjectKeys } = require("../helpers/index");
const db = require("../models/index");
const Activities = db.activities;

// Create and Save a new ACTIVITY: use object.save()

exports.create = async (req, res) => {
  const activity = new Activities({
    // create an instance of a ACTIVITY model
    title: req.body.title,
    level: req.body.level,
    questions: req.body.questions,
    caseIMG: req.body.caseIMG,
    description: req.body.description,
    category: req.body.category,
    author: req.body.author,
  });
  try {
    // if save is successful, the returned promise will fulfill with the document saved
    await activity.save(); // save document in the activities DB collection
    return res.status(201).json({
      success: true,
      message: "New activity was created.",
      URL: `/activities/${activity.title}`,
    });
  } catch (err) {
    // capture mongoose validation errors
    if (err.name === "MongoServerError" && err.code === 11000) {
      return res.status(422).json({
        success: false,
        error: `The activity with name ${req.body.title} already exists!`,
      });
    } else if (err.name === "ValidationError") {
      let errors = [];
      Object.keys(err.errors).forEach((key) => {
        errors.push(err.errors[key].message);
      });
      return res.status(400).json({ success: false, message: errors });
    }
    return res.status(500).json({
      success: false,
      error: err.message || "Some error occurred while creating the activity.",
    });
  }
};

exports.findAll = async (req, res) => {
  let queries = {
    level: req.query.level,
    category: req.query.category,
    author: req.query.author,
  };

  queries = cleanEmptyObjectKeys(queries);

  try {
    // find function parameters: filter, projection (select) / returns a list of documents
    let data = await Activities.find(queries).select("-_id").exec(); // execute the query
    if (data.length == 0) {
      res
        .status(404)
        .json({ success: false, error: "Cannot find any activity!" });
    } else {
      res.status(200).json({ success: true, data });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || "Some error occurred while retrieving activities.",
    });
  }
};

// Delete a ACTIVITY (given its title)
exports.delete = async (req, res) => {
  try {
    const activity = await Activities.findOneAndRemove({
      title: req.params.activityName,
    }).exec();
    if (!activity)
      // returns the deleted document (if any) to the callback
      res.status(404).json({
        message: `Activity ${req.params.activityName} not found.`,
      });
    else
      res.status(200).json({
        message: `Activity ${req.params.activityName} was deleted successfully.`,
      });
  } catch (err) {
    res.status(500).json({
      message: `Error deleting activity with title=${req.params.activityName}.`,
    });
  }
};
