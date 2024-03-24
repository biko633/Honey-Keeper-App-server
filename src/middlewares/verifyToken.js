import jwt from "jsonwebtoken";
import util from "util";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization || req.body.headers.Authorization;
  console.log("server token " + token);
  console.log("verifyToken called by:", req.route.path);
  // console.log("Request object:", req.Authorization);

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
