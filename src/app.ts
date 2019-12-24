import express from "express";
import expressBearerToken from "express-bearer-token";
import jwt from "jsonwebtoken";

import { port, jwtSecret } from "./constants";
import { IntcodeManager } from "./intcode/manager";

type IdToken = { id: number };

const app = express();
app.use(express.json());
app.use(expressBearerToken());

app.use(express.static("static"));

const intcodeManager = new IntcodeManager();

app.post("/", (req, res) => {
  try {
    if (
      req.body.program === undefined ||
      !Array.isArray(req.body.program) ||
      req.body.program.some(isNaN)
    ) {
      throw new Error("Program is not an array of numbers.");
    }
    const id = intcodeManager.createRunner(req.body.program.map(Number));
    const response = jwt.sign({ id }, jwtSecret, { expiresIn: "1h" });
    res.status(201).send({ access_token: response });
  } catch (e) {
    let message = e.message ?? e;
    res.status(400).send(message);
  }
});

app.post("/next", (req, res) => {
  try {
    const token = jwt.verify(req.token!, jwtSecret);
    const id = (token as IdToken).id;
    const input: number | undefined = req.body.input;
    if (input !== undefined && (isNaN(Number(input)) || input === null)) {
      throw new Error("Invalid input value (can only be a number if present).");
    }
    const result = intcodeManager.next(id, Number(input));
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
