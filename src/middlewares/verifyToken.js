import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization || req.Authorization;
  console.log("server token " + token);
  console.log("verifyToken called by:", req.route.path);
  if (!token || token == "") {
    req.errFound = {
      no_token: true,
      message:
        "You have been inactive for too long and your token is expired. Please login again.",
    };
    next();
  } else {
    jwt.verify(token, process.env.access_token_secret, (err, payload) => {
      if (err) {
        err;
        next(err);
      } else {
        req.userID = payload.id;
        next();
      }
    });
  }
};
