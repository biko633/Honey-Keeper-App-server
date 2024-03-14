import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  title: {
    type: "String",
  },
  content: {
    type: "String",
  },
  userOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

export const NoteModel = mongoose.model("notes", NoteSchema);
