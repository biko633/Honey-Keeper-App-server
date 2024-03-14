import mongoose from "mongoose";

const RecoverSchema = new mongoose.Schema({
  email: {
    type: "String",
  },
  question: {
    type: "String",
  },
  answer: {
    type: "String",
  },
  nothing: {
    type: "Boolean",
  },
});

const UserSchema = new mongoose.Schema({
  username: {
    type: "String",
    required: true,
    unique: true,
  },
  password: {
    type: "String",
    required: true,
  },
  recover: {
    type: RecoverSchema,
    required: true,
  },
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "notes",
    },
  ],
});

export const UserModel = mongoose.model("users", UserSchema);
