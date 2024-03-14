import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserModel } from "../models/Users.js";
import generateToken from "../middlewares/generateAccessToken.js";
import { sendMail } from "../middlewares/sendEmail.js";
import { RecoverModel } from "../models/Recover.js";

const router = express.Router();
const PHash = Number(process.env.password_hash);
// 10 minutes //
var maxAge = 10 * 60;
// generateToken is in seconds //
// res.cookie is in milliseconds //

////// SEE IF USER IS IN DATABASE //////
router.post("/", async (req, res, next) => {
  try {
    const username = req.body.username;
    const isFound = await RecoverModel.findOne({ username: username });
    if (isFound === null) {
      return res.json({ found: false });
    } else {
      return res.json({ found: true });
    }
  } catch (err) {
    next(err);
  }
});

/// ADD USER TO DATABASE ////
router.post("/add-user", async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await RecoverModel.findOne({ username: username }).lean();
    if (user) {
      return res.json({
        state: "Failed",
      });
    } else {
      const databaseUser = await UserModel.findOne({
        username: username,
      }).lean();
      if (databaseUser) {
        const newUser = new RecoverModel({
          username: username,
          valid: true,
          expireAt: new Date(),
        });
        await newUser.save();
        return res.json({ state: "Successful" });
      }
      return res.json({
        error: "User does't exist",
      });
    }
  } catch (err) {
    next(err);
  }
});

//// SEND EMAIL TO USER ////
router.post("/send-email", async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await UserModel.findOne({ username: username });
    if (user?.username === username && user?.recover?.email) {
      const payload = {
        email: user.recover.email,
        username: user.username,
      };
      const email_token = generateToken(
        payload,
        process.env.change_password_token_secret,
        maxAge
      );
      sendMail(user?.recover?.email, email_token);
      return res.json({ state: "Successful" });
    } else {
      next({
        status: 400,
        error: "Bad Request",
        message:
          "The email request was malformed or invalid. Please try again.",
      });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/add-question-token", async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await RecoverModel.findOne({ username: username });
    if (user) {
      const payload = {
        username: user.username,
      };
      const question_token = generateToken(
        payload,
        process.env.question_token,
        maxAge
      );
      return res.json({ state: "Successful", token: question_token });
    } else {
      next({
        status: 404,
        error: "Not Found",
        message: "User Not Found",
      });
    }
  } catch (err) {
    next(err);
  }
});

////// CHECK QUESTION TOKEN //////
router.post("/check-question-token", async (req, res, next) => {
  const token = req.body.token;
  try {
    jwt.verify(token, process.env.question_token, async (err, payload) => {
      if (err) {
        // debugger;
        next(err);
      } else {
        const username = payload.username;
        const user = await RecoverModel.findOne({
          username: username,
        });
        /// RETURN NULL IF NOT FOUND IN EMAIL MODEL ////
        if (user) {
          const databaseUser = await UserModel.findOne({ username: username });
          const question = databaseUser?.recover?.question;
          return res.json({
            successful: true,
            question: question,
          });
        } else {
          next({
            status: 401,
            error: "Unauthorized",
            message:
              "You took too long to change your password. Please try again.",
          });
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

//// SUBMIT QUESTION ANSWER //////
router.post("/submit-question-token", async (req, res, next) => {
  const token = req.body.token;
  const answer = req.body.answer;
  try {
    jwt.verify(token, process.env.question_token, async (err, payload) => {
      if (err) {
        // debugger;
        next(err);
      } else {
        const username = payload.username;
        const user = await RecoverModel.findOne({
          username: username,
        });
        /// RETURN NULL IF NOT FOUND IN EMAIL MODEL ////
        if (user) {
          if (user.valid === true) {
            const databaseUser = await UserModel.findOne({
              username: username,
            });
            const isAnswerValid = await bcrypt.compare(
              answer,
              databaseUser.recover.answer
            );
            if (isAnswerValid) {
              ////// CREATE NEW PASSWORD TOKEN ///////
              const payload = {
                username: user.username,
              };
              const question_token = generateToken(
                payload,
                process.env.change_password_token_secret,
                maxAge
              );
              return res.json({ state: "Successful", token: question_token });
            } else {
              user.valid = false;
              user.save();
              return res.json({
                error: "failed",
              });
            }
          } else {
            next({
              status: 401,
              error: "Unauthorized",
              message: "Your answer was wrong. Please try again another time.",
            });
          }
        } else {
          next({
            status: 401,
            error: "Unauthorized",
            message:
              "You took too long to change your password. Please try again.",
          });
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

///// CHECK PASSWORD TOKEN /////
router.post("/check-password-token", async (req, res, next) => {
  const token = req.body.token;
  try {
    jwt.verify(
      token,
      process.env.change_password_token_secret,
      async (err, payload) => {
        if (err) {
          // debugger;
          next(err);
        } else {
          const username = payload.username;
          const user = await RecoverModel.findOne({ username: username });
          if (user) {
            return res.json({
              successful: true,
            });
          } else {
            next({
              status: 401,
              error: "Unauthorized",
              message:
                "You took too long to change your password. Please try again.",
            });
          }
        }
      }
    );
  } catch (err) {
    next(err);
  }
});

router.post("/resetPassword", async (req, res, next) => {
  const token = req.body.token;
  const newPassword = req.body.newPassword;
  try {
    jwt.verify(
      token,
      process.env.change_password_token_secret,
      async (err, payload) => {
        if (err) {
          next(err);
        } else {
          const reset_token = await RecoverModel.findOne({
            username: payload.username,
          });
          if (reset_token) {
            const hashedPassword = await bcrypt.hash(newPassword, PHash);
            const user = await UserModel.findOneAndUpdate(
              { username: payload.username },
              { password: hashedPassword }
            );
            await RecoverModel.findOneAndDelete({ username: payload.username });
            res.json({ successful: true });
          } else {
            next({
              status: 401,
              error: "Unauthorized",
              message:
                "You took too long to change your password. Please try again.",
            });
          }
        }
      }
    );
  } catch (err) {
    next(err);
  }
});

export default router;
