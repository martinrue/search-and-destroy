import * as game from "./game.js";
import * as logs from "./logs.js";
import { printHeader } from "./header.js";
import { ask } from "./input.js";
import { wait } from "./wait.js";
import { post } from "./http.js";

const GRIDSIZE = 10;
const MAX_TURNS = 50;

let turn = 1;
let lastRadar = null;

const startBot = async (url, getRadar) => {
  try {
    const body = {
      data: { radar: getRadar() },
    };

    await post(`${url}/start`, body, false);
  } catch (err) {
    return err;
  }
};

const getTurn = async (url, data) => {
  try {
    const turn = await post(`${url}/turn`, { data }, true);
    return { turn };
  } catch (err) {
    return { err };
  }
};

const sendRadar = async (url, radar) => {
  try {
    const body = {
      data: { radar },
    };

    await post(`${url}/radar`, body, false);
  } catch (err) {
    return err;
  }
};

const stopBot = async (url, result, turns) => {
  try {
    const body = {
      data: { result, turns },
    };

    await post(`${url}/stop`, body, false);
  } catch (err) {
    return err;
  }
};

const run = async (delay) => {
  const renderFrame = (winner = null) => {
    console.clear();
    printHeader();

    console.log(game.renderGrid(game.generateGrid("overview", winner), turn));

    logs.getLast(5).forEach((log) => {
      console.log(`  ${log.turn}: ${log.msg}`);
    });

    console.log();
  };

  const startBots = async () => {
    const bot1Err = await startBot(p1Url, () => game.generateGrid("initial-p1"));

    if (bot1Err) {
      return `player 1 failed to start: ${bot1Err}`;
    }

    logs.add(0, `player 1 initialised at ${game.getPlayerPositions().p1.x},${game.getPlayerPositions().p1.y}`);

    const bot2Err = await startBot(p2Url, () => game.generateGrid("initial-p2"));

    if (bot2Err) {
      return `player 2 failed to start: ${bot2Err}`;
    }

    logs.add(0, `player 2 initialised at ${game.getPlayerPositions().p2.x},${game.getPlayerPositions().p2.y}`);
  };

  const stopBots = async ({ p1Won, p2Won, turn }) => {
    const draw = !p1Won && !p2Won;

    const bot1Err = await stopBot(p1Url, draw ? "draw" : p1Won ? "won" : "lost", turn);

    if (bot1Err) {
      return `player 1 failed to stop: ${bot1Err}`;
    }

    const bot2Err = await stopBot(p2Url, draw ? "draw" : p2Won ? "won" : "lost", turn);

    if (bot2Err) {
      return `player 1 failed to stop: ${bot2Err}`;
    }
  };

  const play = async () => {
    const addLog = (msg) => logs.add(turn, msg);

    const p1Turn = await getTurn(p1Url, {
      minesRemaining: game.getMinesRemaining().p1,
      opponentUsedRadar: lastRadar === "p2",
    });

    lastRadar = null;

    if (p1Turn.err) {
      return { err: `player 1 failed to play turn: ${p1Turn.err}` };
    }

    const p1Result = game.playTurn({ p1: true, turn: p1Turn.turn, addLog });

    if (p1Result.err) {
      addLog(`player 1 turn error: ${p1Result.err}`);
    }

    if (p1Result.p1Won || p1Result.p2Won) {
      renderFrame();
      return p1Result;
    }

    if (p1Result.radar) {
      const p1SendRadarErr = await sendRadar(p1Url, p1Result.radar);

      if (p1SendRadarErr) {
        addLog(`player 1 radar error: ${p1SendRadarErr}`);
      }

      lastRadar = "p1";
    }

    const p2Turn = await getTurn(p2Url, {
      minesRemaining: game.getMinesRemaining().p2,
      opponentUsedRadar: lastRadar === "p1",
    });

    lastRadar = null;

    if (p2Turn.err) {
      return { err: `player 2 failed to play turn: ${p2Turn.err}` };
    }

    const p2Result = game.playTurn({ p2: true, turn: p2Turn.turn, addLog });

    if (p2Result.err) {
      addLog(`player 2 turn error: ${p2Result.err}`);
    }

    if (p2Result.p1Won || p2Result.p2Won) {
      renderFrame();
      return p2Result;
    }

    if (p2Result.radar) {
      const p2SendRadarErr = await sendRadar(p2Url, p2Result.radar);

      if (p2SendRadarErr) {
        addLog(`player 2 radar error: ${p2SendRadarErr}`);
      }

      lastRadar = "p2";
    }

    renderFrame();

    turn += 1;

    if (turn > MAX_TURNS) {
      turn = MAX_TURNS;
      renderFrame();
      return { p1Won: false, p2Won: false };
    }

    await wait(delay);
    return await play();
  };

  game.init(p1Url, p2Url, GRIDSIZE);

  const startErr = await startBots();

  if (startErr) {
    console.error(startErr);
    return;
  }

  renderFrame();

  await ask("players ready – hit enter to start...");

  const { p1Won, p2Won, err } = await play();

  if (err) {
    logs.add(turn, err);
    renderFrame();
  }

  if (!err) {
    if (p1Won || p2Won) {
      logs.add(turn, `game over – ${p1Won ? "player 1" : "player 2"} won`);
    } else {
      logs.add(turn, `game over – it's a draw`);
    }

    renderFrame(p1Won ? "p1" : p2Won ? "p2" : "");
  }

  const stopErr = await stopBots({ p1Won, p2Won, turn });

  if (stopErr) {
    console.error(stopErr);
    return;
  }

  const showFullHistory = await ask("show full history? ");

  if (showFullHistory === "yes" || showFullHistory === "y") {
    console.clear();

    logs.getAll().forEach((log) => {
      console.log(`${log.turn}: ${log.msg}`);
    });
  }
};

const p1Url = process.argv[2];
const p2Url = process.argv[3];
const turnDelay = parseInt(process.argv[4]);

if (!p1Url || !p2Url || isNaN(turnDelay)) {
  console.error("usage: <player1-url> <player2-url> <turn-delay>");
  process.exit(1);
}

run(turnDelay);
