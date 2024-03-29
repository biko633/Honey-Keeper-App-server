import express from "express";
import { RefreshTokenModel } from "../models/RefreshToken.js";
import { UserModel } from "../models/Users.js";
import generateToken from "../middlewares/generateAccessToken.js";
import jwt from "jsonwebtoken";

const router = express.Router();
// 60 MINUTES //
var access_maxAge = 60 * 60;
// 120 MINUTES //
var refresh_maxAge = 120 * 60;

// generateToken is in seconds //
// res.cookie is in milliseconds //

router.get("/wait_for_token", async (req, res, next) => {
  // const userID = req.query.id;
  // try {
  //   if (userID.length !== 24) {
  //     res.json({ error: "User id is wrong" });
  //   }
  //   const user = await UserModel.findById(userID);
  //   if (!user) {
  //     ("you are not an authenticated user");
  //     res.json({ error: "you are not an authenticated user" });
  //   } else {
  //     const r_token = await RefreshTokenModel.findOne({ userId: userID });
  //     if (r_token) {
  //       await RefreshTokenModel.deleteOne({ userId: userID });
  //     }
  //     const payload = {
  //       id: userID,
  //     };
  //     const refreshToken = generateToken(
  //       payload,
  //       process.env.refresh_token_secret,
  //       refresh_maxAge
  //     );
  //     const newToken = new RefreshTokenModel({
  //       userId: userID,
  //       token: refreshToken,
  //       expireAt: new Date(),
  //     });
  //     await newToken.save();
  res.json({ message: "waited" });
  //   }
  // } catch (err) {
  //   next(err);
  // }
});

////// CHECK IF THE USER HAS REFRESH TOKEN ////////
router.get("/check_token", async (req, res, next) => {
  const token = req.query.token;
  try {
    jwt.verify(token, process.env.access_token_secret, (err, payload) => {
      if (err) {
        next(err);
      } else {
        res.json({ message: "Found" });
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get("/add_AccessToken", async (req, res, next) => {
  const userID = req.query.id;
  try {
    // if (userID.length !== 24) {
    //   res.json({ error: "User id is wrong" });
    // }
    const user = await UserModel.findById(userID);
    if (!user) {
      ("you are not an authenticated user");
      res.json({ message: "you are not an authenticated user" });
    }
    const payload = {
      id: userID,
    };
    const access_token = generateToken(
      payload,
      process.env.access_token_secret,
      access_maxAge
    );
    // const cookieOptions = {
    //   maxAge: maxAge * 1000,
    //   sameSite: "None",
    //   secure: true,
    // };

    // res.setHeader(
    //   "Set-Cookie",
    //   `token=${access_token}; ${Object.entries(cookieOptions)
    //     .map(([key, value]) => `${key}=${value}`)
    //     .join("; ")}`
    // );
    // res.cookie("token", access_token, {
    //   maxAge: access_maxAge * 1000,
    //   SameSite: "None",
    //   secure: true,
    //   httpOnly: false,
    // });
    res.json({ message: "Access token added", token: access_token });
  } catch (err) {
    next(err);
  }
});

export default router;
