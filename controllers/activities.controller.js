const { cleanEmptyObjectKeys } = require("../helpers/index");
const db = require("../models/index");
const User = db.users;
const Activity = db.activities;
const Emotion = db.emotions;

// not finished - possible add to tutor/teacher
exports.create = async (req, res) => {
  if (req.typeUser === "Criança") {
    return res.status(403).json({
      success: false,
      error: "You don't have permission to create activities!",
    });
  }

  const activity = new Activity({
    title: req.body.title,
    level: req.body.level,
    questions: req.body.questions,
    caseIMG: req.body.caseIMG,
    description: req.body.description,
    category: req.body.category,
    author: req.username,
  });
  try {
    for (const question of activity.questions) {
      const emotion = await Emotion.findOne({
        name: question.correctAnswer,
      }).exec();
      if (!emotion) {
        return res.status(404).json({
          success: false,
          error: `Cannot find any emotion with name ${question.correctAnswer}!`,
        });
      }
    }
    const emotions = await Emotion.find().select("name -_id").exec();
    let list = emotions.map((e) => e.name);
    // add emotions on question answers
    activity.questions = activity.questions.map((question) => ({
      ...question,
      answers: list,
    }));
    await activity.save(); // save document in the activities DB collection
    // add to tutor/teacher
    if (req.typeUser !== "Admin") {
      await User.findOneAndUpdate(
        { username: req.username },
        { $push: { activitiesPersonalized: activity.title } },
        {
          returnOriginal: false, // to return the updated document
          runValidators: false, //runs update validators on update command
          useFindAndModify: false, //remove deprecation warning
        }
      ).exec();
    }
    return res.status(201).json({
      success: true,
      message: "New activity was created!",
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
      return res.status(400).json({ success: false, error: errors });
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
  };
  queries = cleanEmptyObjectKeys(queries);

  try {
    let all = await Activity.find(queries).select("-_id").exec();
    // get public/admin activities
    let admins = await User.find({ typeUser: "Administrador" })
      .select("username -_id")
      .exec();
    admins = admins.map((a) => a.username);
    let public = all.filter((a) => admins.includes(a.author));
    if (req.typeUser === "Administrador") {
      return res.status(200).json({ success: true, activities: public });
    }

    // get tutor/teacher activities
    if (req.typeUser === "Tutor" || req.typeUser === "Professor") {
      let personalized = all.filter((a) => a.author === req.username);
      return res
        .status(200)
        .json({ success: true, activities: [...public, ...personalized] });
    }

    // get child activities
    queries.author = req.query.author;
    let child = await User.findOne({ username: req.username }).exec();
    let personalized = all.filter(
      (a) =>
        child.activitiesSuggested.includes(a.title) &&
        a.author === queries.author
    );
    return res.status(200).json({
      success: true,
      activities: queries.author ? personalized : [...public, ...personalized],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Some error occurred while retrieving activities.",
    });
  }
};

/*
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
*/
