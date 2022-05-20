const jwt = require("jsonwebtoken");
const config = require("../config/config");

exports.verifyToken = (req, res, next) => {
  // search token in headers most commonly used for authorization
  const header = req.headers["x-access-token"] || req.headers.authorization;
  if (typeof header == "undefined")
    return res.status(401).json({
      success: false,
      message: "Must be authenticated with a token to access this information!",
    });
  const bearer = header.split(" "); // Authorization: Bearer <token>
  const token = bearer[1];
  try {
    let decoded = jwt.verify(token, config.SECRET);
    req.username = decoded.username;
    req.typeUser = decoded.typeUser;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized!" });
  }
};
