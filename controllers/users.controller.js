//const db = require("../models/index.js");
//const User = db.users;

exports.login = (req, res) => {
  if (!(req.body.username && req.body.password)) {
    return res.status(400).json({ error: "Username or password invalid!" });
  }
  // res.status(401).json({error: "Username and password don’t match. Try again!"})
  // res.status(403).json({error: "Your account is blocked. Please try again later!"})
  // res.status(500).json({error: "Some error occurred while trying to login!"})
  return res.status(200).json({ username: `${req.body.username}` });
};

exports.create = (req, res) => {
  return res.status(200).json({ msg: "OK" });
};

exports.find = (req, res) => {
  return res.status(200).json({ msg: "OK" });
};

exports.edit = (req, res) => {
  return res.status(200).json({ msg: "OK" });
};

exports.findAll = (req, res) => {
  return res.status(200).json({ msg: "OK" });
};

exports.remove = (req, res) => {
  return res.status(200).json({ msg: "OK" });
};

exports.createRelation = (req, res) => {
  return res.status(200).json({ msg: "OK" });
};

exports.removeRelation = (req, res) => {
  return res.status(200).json({ msg: "OK" });
};

exports.findRelations = (req, res) => {
  return res.status(200).json({ msg: "OK" });
};
