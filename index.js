import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import notesRouter from "./src/routes/notes.js";
import usersRouter from "./src/routes/users.js";
import refreshTokenRouter from "./src/routes/refresh_token.js";
import recoverRouter from "./src/routes/recover.js";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

dotenv.config();

const port = process.env.PORT;
const server_url = process.env.SERVER_URL;
const client_url = process.env.CLIENT_URL;
const app = express();

app.use(cookieParser());
app.use(express.json());

const corsConfig = {
  credentials: true,
  origin: [client_url, server_url],
  methods: ["GET", "POST", "PUT"],
  sameSite: "None",
  secure: true, // Ensure that the Secure attribute is set
};
app.use(cors(corsConfig));

app.use("/notes", notesRouter);
app.use("/users", usersRouter);
app.use("/refresh_token", refreshTokenRouter);
app.use("/recover", recoverRouter);
app.use((err, req, res, next) => {
  // debugger;
  return res.status(err.status || 500).send({
    error: err.error || "Error",
    status: err.status || 500,
    message: err.message || "Something went wrong",
    timestamp: Date.now(),
    path: req.originalUrl,
  });
});

// const __filename = fileURLToPath(import.meta.url);

// const __dirname = path.dirname(__filename);

// app.use(express.static(path.join(__dirname + "/public", "dist")));

// app.get("/*", function (req, res) {
//   res.sendFile(path.join(__dirname + "/public", "dist", "index.html"));
// });

// MONGODB //

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.data_URL);
    console.log("database connected");
  } catch (err) {
    err;
  }
};

app.listen(port, () => {
  connectDB();
  console.log("server started");
});
