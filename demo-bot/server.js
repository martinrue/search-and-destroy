import express from "express";
import * as bot from "./bot.js";

const api = express();

api.use(express.json());

api.post("/start", (req, res) => {
  bot.start(req.body.data);
  res.status(200).end();
});

api.post("/turn", (req, res) => {
  res.json(bot.turn(req.body.data));
});

api.post("/radar", (req, res) => {
  bot.handleRadar(req.body.data);
  res.status(200).end();
});

api.post("/stop", (req, res) => {
  bot.stop(req.body.data);
  server.close();
  res.status(200).end();
});

api.use((err, req, res, next) => {
  console.error(`error: ${err}`);
  res.status(err.statusCode ?? 500).end();
});

api.use((req, res, next) => {
  res.status(404).end();
});

const port = parseInt(process.argv[2]);

if (isNaN(port)) {
  console.error("usage: server <port>");
  process.exit(1);
}

const server = api.listen(port, () => {
  console.log(`bot ready at http://localhost:${port}`);
});
