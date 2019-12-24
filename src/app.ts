import express from "express";
import expressBearerToken from "express-bearer-token";
import jwt from "jsonwebtoken";

import { port, jwtSecret } from "./constants";
import { IntcodeManager } from "./intcode/manager";

type IdToken = { id: number };

const app = express();
app.use(express.json());
app.use(expressBearerToken());

const intcodeManager = new IntcodeManager();

app.post("/", (req, res) => {
  // Do verification of req body
  const id = intcodeManager.createRunner(req.body.program);
  const response = jwt.sign({ id }, jwtSecret, { expiresIn: "1h" });
  res.status(201).send({ token: response });
});

app.post("/next", (req, res) => {
  try {
    const token = jwt.verify(req.token!, jwtSecret);
    const id = (token as IdToken).id;
    const input = req.body.input;
    const result = intcodeManager.next(id, input);
    res.status(200).send(result);
  } catch (e) {
    let message = e.message ?? e;
    if (message === "jwt expired") {
      message = "The runner has expired and is not available anymore.";
    }
    res.status(400).send(message);
  }
});

app.listen(port);
