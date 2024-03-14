import mongoose from "mongoose";

const RecoverSchema = new mongoose.Schema({
  username: {
    type: "string",
    required: true,
  },
  email: {
    type: "String",
  },
  question: {
    type: "String",
  },
  valid: {
    type: "Boolean",
  },
  expireAt: {
    type: Date,
    default: Date.now,
    index: { expireAfterSeconds: 600 },
    required: true,
  },
  endAfter: {
    type: "String",
    default: "expires after 10 minutes",
  },
});

export const RecoverModel = mongoose.model("recover", RecoverSchema);
