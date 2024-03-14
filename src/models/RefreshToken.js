import mongoose from "mongoose";
import ms from "ms";
const ttl = ms("2h");

const RefreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  token: {
    type: String,
    required: true,
  },
  expireAt: {
    type: Date,
    default: Date.now,
    index: { expireAfterSeconds: 7200 },
    required: true,
  },
  endAfter: {
    type: "String",
    default: "expires after 2 hours",
  },
});

export const RefreshTokenModel = mongoose.model(
  "refresh_token",
  RefreshTokenSchema
);
