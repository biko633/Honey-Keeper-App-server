import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserModel } from "../models/Users.js";
import { RefreshTokenModel } from "../models/RefreshToken.js";
import generateToken from "../middlewares/generateAccessToken.js";

const router = express.Router();
const PHash = Number(process.env.password_hash);
const AHash = Number(process.env.answer_hash);
var maxAge = 0;
// generateToken is in seconds //
// res.cookie is in millisecondss //

function validateUsername(username) {
  const regex = /^(?!.*\s)[a-zA-Z0-9_-]{3,20}$/;
  if (regex.test(username)) {
    return true;
  } else {
    return false;
  }
}

function validatePassword(password) {
  const regex = /^(?!.*\s)[\w*#$@!]{1,127}$/;
  if (regex.test(password)) {
    return true;
  } else {
    return false;
  }
}

function validateEmail(email) {
  const regex = /^(?!$)[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (regex.test(email)) {
    return true;
  } else {
    return false;
  }
}

function validateAnswer(answer) {
  const regex = /^(?!$)[a-zA-Z0-9\s]{1,20}$/;
  if (regex.test(answer)) {
    return true;
  } else {
    return false;
  }
}

//REGISTER A USER//
router.post("/register", async (req, res, next) => {
  try {
    // debugger;
    const { username, password, recover, type } = req.body;
    if (validateUsername(username) === false) {
      return res.json({
        error:
          "Invalid username, username must be 3-20 characters with no spaces or special characters other than _ and -",
      });
    } else if (validatePassword(password) === false) {
      return res.json({
        error:
          "Invalid password, password must be 1-127 characters with no spaces or special characters other than _ * $ # @ !",
      });
    } else if (type === "email" && validateEmail(recover.email) === false) {
      return res.json({
        error:
          "Invalid email address, email must be a valid email address with no spaces",
      });
    } else if (type === "answer" && validateAnswer(recover.answer) === false) {
      return res.json({
        error: "Invalid answer, answer must be 1-20 characters with no spaces",
      });
    }

    const lower_case_username = username.toLowerCase();
    const user = await UserModel.findOne({ username: username }).collation({
      locale: "en",
      strength: 2,
    });
    if (type === "email") {
      const baseEmail = await UserModel.findOne({
        "recover.email": recover?.email,
      });
      if (baseEmail?.recover?.email == recover?.email) {
        return res.json({ error: "This email is already in use" });
      }
    }
    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ REMOVE THIS LATER $$$$$$$$$$$$$$$$$$$$$$$
    if (user?.username.toLowerCase() == lower_case_username) {
      return res.json({ error: "User already exists!" });
    }
    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    else {
      // debugger;
      const hashedPassword = await bcrypt.hash(password, PHash);
      if (type === "answer") {
        const hashedAnswer = await bcrypt.hash(recover.answer, AHash);
        const newUser = new UserModel({
          username: username,
          password: hashedPassword,
          recover: {
            ...recover,
            answer: hashedAnswer,
          },
        });
        await newUser.save();
        var newUserId = newUser._id;
      } else {
        const newUser = new UserModel({
          username: username,
          password: hashedPassword,
          recover: recover,
        });
        await newUser.save();
        var newUserId = newUser._id;
      }

      maxAge = 3600;

      const payload = {
        id: newUserId,
      };
      const token = generateToken(
        payload,
        process.env.access_token_secret,
        maxAge
      );

      res.cookie("token", token, {
        maxAge: maxAge * 1000,
        sameSite: "none",
        secure: true,
      });

      return res.json({ Success: true, id: newUserId });
    }
  } catch (err) {
    next(err);
  }
});

//LOGIN A USER//
router.post("/login", async (req, res, next) => {
  try {
    const { username, password, remember } = req.body;
    if (
      validateUsername(username) === false ||
      validatePassword(password) === false
    ) {
      return res.json({ error: "Invalid username or password" });
    }
    if (remember === true) {
      maxAge = 86400;
    } else {
      maxAge = 3600;
    }
    const user = await UserModel.findOne({ username: username }).collation({
      locale: "en",
      strength: 2,
    });
    if (!user) {
      return res.json({ error: "User doesn't exists!" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ error: "Username or password is incorrect" });
    }

    const payload = {
      id: user._id,
    };
    const token = generateToken(
      payload,
      process.env.access_token_secret,
      maxAge
    );
    res.cookie("token", token, {
      maxAge: maxAge * 1000,
      sameSite: "none",
      secure: true,
    });

    return res.json({ Success: true, id: user.id });
  } catch (err) {
    next(err);
  }
});

router.get("/userId", async (req, res, next) => {
  const token = req.query.token;
  try {
    if (token === undefined) {
      return res.json({ empty: true });
    }
    const response = jwt.verify(
      token,
      process.env.access_token_secret,
      (err, payload) => {
        if (err) {
          next(err);
        } else {
          return res.json({ userID: payload.id });
        }
      }
    );
  } catch (err) {
    next(err);
  }
});

router.put("/logout", async (req, res) => {
  const userID = req.query.id;
  try {
    res.clearCookie("token");
    const r_token = await RefreshTokenModel.deleteOne(userID);
    res.json({ status: "Success" });
  } catch (err) {
    res.json({ status: "Failed" });
  }
});

router.post("/recover-info", async (req, res) => {
  const username = req.body.username;
  const user = await UserModel.findOne({ username: username });
  if (!user) {
    return res.json({ error: "User doesn't exists!" });
  } else {
    if (user.recover?.question) {
      return res.json({ question: true, status: "Success" });
    } else if (user.recover?.email) {
      return res.json({ email: true, status: "Success" });
    } else {
      return res.json({ nothing: true, status: "Success" });
    }
  }
});

export default router;
