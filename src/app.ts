import express from "express";
import expressBearerToken from "express-bearer-token";
import jwt from "jsonwebtoken";

import { port, jwtSecret } from "./constants";
import { IntcodeManager } from "./intcode/manager";

const app = express();
app.use(express.json());
app.use(expressBearerToken());

const intcodeManager = new IntcodeManager();

app.post("/", (req, res) => {
  // Do verification of req body
  const id = intcodeManager.createRunner(req.body.program);
  const response = jwt.sign({ id }, jwtSecret, { expiresIn: "1s" });
  res.status(201).send(response);
});

app.post("/next", (req, res) => {
  console.log(jwt.verify(req.token!, jwtSecret));
});

app.listen(port);
