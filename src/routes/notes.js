import express from "express";
import { NoteModel } from "../models/Notes.js";
import { UserModel } from "../models/Users.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { cleanHTML } from "../middlewares/cleanHTML.js";

const router = express.Router();

// GET USERS SAVED NOTES //
router.get("/savedNotes", verifyToken, async (req, res, next) => {
  if (req.errFound) {
    return res.json({ no_token: req.errFound });
  }
  try {
    const notes = await NoteModel.find({ userOwner: req.userID });
    return res.json({ notes: notes });
  } catch (err) {
    next(err);
  }
});

//THIS IS GETTING NOTES IDS FROM A USER (NOT IN USE)//
router.get("/savedNotes/ids/:userID", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userID);
    return res.json(user.notes);
  } catch (err) {
    return res.json(err);
  }
});

//CREATE A NEW NOTE (FOR A USER)//
router.post("/:userID", verifyToken, async (req, res, next) => {
  if (req.errFound) {
    return res.json({ no_token: req.errFound });
  }
  try {
    const cleanContent = cleanHTML(req.body.content);
    const note = new NoteModel({
      title: req.body.title,
      content: cleanContent,
      userOwner: req.params.userID,
    });

    const response = await note.save();
    return res.json(response);
  } catch (err) {
    next(err);
  }
});

//SAVE THE NOTE TO THE USER//
router.put("/", verifyToken, async (req, res, next) => {
  if (req.errFound) {
    return res.json({ no_token: req.errFound });
  }
  try {
    const note = await NoteModel.findById(req.body.noteID);
    const user = await UserModel.findById(req.body.userID);
    user.notes.push(note);
    await user.save();
    return res.json({ Successfully: true });
  } catch (err) {
    next(err);
  }
});

//DELETE THE NOTE FROM THE USER AND NOTE MODEL//
router.put("/deletedNote", verifyToken, async (req, res, next) => {
  console.log("i am in the delete route " + req.headers.authorization);
  if (req.errFound) {
    return res.json({ no_token: req.errFound });
  }
  try {
    await NoteModel.findByIdAndDelete(req.body.noteID);
    const user = await UserModel.findById(req.body.userID);
    user.notes.pull(req.body.noteID);
    await user.save();
    res.json({ Successfully: true });
  } catch (err) {
    next(err);
  }
});

export default router;
