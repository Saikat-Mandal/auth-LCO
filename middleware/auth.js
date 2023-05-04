const jwt = require("jsonwebtoken");

// model is optional

const auth = (req, res, next) => {
  // console.log(req.cookies);
  const token =
    req.body.token ||
    req.cookies.token ||
    req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return res.status(403).send("token is missing");
  }

  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decode;
    // bring in info from the db
  } catch (e) {
    return res.status(401).send("invalid token");
  }

  return next();
};

module.exports = auth;
