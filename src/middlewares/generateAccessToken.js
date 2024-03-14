import jwt from "jsonwebtoken";

export default function generateAccessToken(payload, secret, tte) {
  return jwt.sign(payload, secret, {
    expiresIn: tte,
  });
}
