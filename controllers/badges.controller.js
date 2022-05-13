const db = require("../models");
const Badges = db.badges;
// Create and Save a new BADGE: use object.save()

exports.create = async (req, res) => {
    const badge = new Badges({ // create an instance of a BADGE model
        badgeName: req.body.badgeName,
        badgeIMG: req.body.badgeIMG,
        pointsNedded: req.body.pointsNedded,
        badgeEmotion:req.body.badgeEmotion
    });
    try { // if save is successful, the returned promise will fulfill with the document saved
        await badge.save(); // save document in the badges DB collection
        res.status(201).json({
            success: true, msg: "New badge created.", URL: `/badge/${badge.badgeName}`
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
            msg: err.message || "Some error occurred while creating the badge. "
        });
    }
};

// retrieve all badges / or find by title
exports.findAll = async (req, res) => {
    const emotion = req.query.emotion;
    // build REGEX to filter badges titles with a sub-string - i will do a case insensitive match
        const condition = emotion ? { emotion: new RegExp(title, 'i') } : {};
    try {
        // find function parameters: filter, projection (select) / returns a list of documents
        let data = await Badges.find(condition)
            .exec(); // execute the query
        res.status(200).json(data);
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
        const badge = await Badges.findOneAndRemove({badgeName:req.params.badge}).exec();
        if (!badge) // returns the deleted document (if any) to the callback
            res.status(404).json({
                message: `Not found badge with badgeName=${req.params.badge}.`
            });
        else
            res.status(200).json({
                message: `Badge badgeName=${req.params.badge} was deleted successfully.`
            });
    } catch (err) {
        res.status(500).json({
            message: `Error deleting Badge with id=${req.params.badge}.`
        });
    };
};
    
    

