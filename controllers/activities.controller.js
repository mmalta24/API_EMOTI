const db = require("../models");
const Activities = db.activities;
// Create and Save a new BADGE: use object.save()

exports.create = async (req, res) => {
    const activity = new Activities({ // create an instance of a BADGE model
        title: req.body.title,
        level: req.body.level,
        questions: req.body.questions,
        caseIMG:req.body.caseIMG,
        description:req.body.description,
        category:req.body.category,
        author:req.body.author
    });
    try { // if save is successful, the returned promise will fulfill with the document saved
        await activity.save(); // save document in the badges DB collection
        res.status(201).json({
            success: true, msg: "New activity was created.", URL: `/activities/${activity.title}`
        });
    }
    catch (err) {
        // capture mongoose validation errors
        if (err.name === "ValidationError") {
            let errors = [];
            Object.keys(err.errors).forEach((key) => {
                errors.push(err.errors[key].message);
            });
            return res.status(400).json({ success: false, msgs: errors });
        }
        res.status(500).json({
            success: false,
            msg: err.message || "Some error occurred while creating the activity. "
        });
    }
};


exports.findAll = async (req, res) => {
    let queries = {
        level: req.query.level,
        category: req.query.category,
        author: req.query.author
    }

    function clean(obj) {
        for (var propName in obj) {
            if (obj[propName] === null || obj[propName] === undefined) {
                delete obj[propName];
            }
        }
        return obj
    }

    clean(queries)

    try {
        // find function parameters: filter, projection (select) / returns a list of documents
        let data = await Activities.find(queries)
            .exec(); // execute the query
        if(data.length==0){
            res.status(404).json({
                message: "Cannot find any activity!"
            });
        }
        else{
            res.status(200).json(data);
        }
        
    }
    catch (err) {
        res.status(500).json({
            message:
                err.message || "Some error occurred while retrieving badges."
        });
    }
};

// Delete a BADGE (given its id)
exports.delete = async (req, res) => {
    try {
        const activity = await Activities.findOneAndRemove({title:req.params.activityName}).exec();
        if (!activity) // returns the deleted document (if any) to the callback
            res.status(404).json({
                message: `Not found badge with badgeName=${req.params.activityName}.`
            });
        else
            res.status(200).json({
                message: `Badge badgeName=${req.params.activityName} was deleted successfully.`
            });
    } catch (err) {
        res.status(500).json({
            message: `Error deleting Badge with badgeName=${req.params.activityName}.`
        });
    };
};