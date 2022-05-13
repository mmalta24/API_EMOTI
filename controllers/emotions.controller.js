const db = require("../models");
const Emotion = db.emotions;

exports.create = async (req, res) => {

    const emotion = new Emotion({ 
        name: req.body.name,
    });
    try { // if save is successful, the returned promise will fulfill with the document saved
        await emotion.save(); // save document in the badges DB collection
        res.status(201).json({
            success: true, msg: "New emotion created.", URL: `/emotion/${emotion.name}`
        });
    }

    catch (err) {
        if (err.name === "ValidationError") {
            let errors = [];
            Object.keys(err.errors).forEach((key) => {
                errors.push(err.errors[key].message);
            });
            return res.status(400).json({ success: false, msgs: errors });
        }
        res.status(500).json({
            success: false,
            msg: err.message || "Some error occurred while creating the emotion. "
        });
    }
};


exports.findAll = async (req, res) => {
    try {
        const emotion = await Emotion.find().exec();
        if (emotion === null)
            res.status(404).json({
                message: `Emotions not found.`
            });
        else
            res.status(200).json(emotion);
    }
    catch (err) {
        res.status(500).json({
            message: err.message || `Error retrieving Emotions.`
        })
    }

};


exports.remove = async (req, res) => {
    try {
        const emotion = await Emotion.findOneAndRemove({name:req.params.name}).exec();
        if (!emotion) // returns the deleted document (if any) to the callback
            res.status(404).json({
                message: `Emotion ${req.params.name} not found .`
            });
        else
            res.status(200).json({
                message: `Emotion ${req.params.name} was deleted successfully.`
            });
    } catch (err) {
        res.status(500).json({
            message: `Error deleting Emotion ${req.params.name}.`
        });
    };
};