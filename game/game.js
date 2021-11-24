const TURN_MOVE = "MOVE";
const TURN_LAYMINE = "LAYMINE";
const TURN_RUNRADAR = "RUNRADAR";

const VALID_TURNS = [TURN_MOVE, TURN_LAYMINE, TURN_RUNRADAR];

let state = null;

export const init = (p1Url, p2Url, size) => {
  const random = () => Math.floor(Math.random() * size);

  state = {
    size,
    mines: [],
    p1: { x: random(), y: random(), minesRemaining: 3 },
    p2: { x: random(), y: random(), minesRemaining: 3 },
    pickups: [
      { x: 0, y: 0 },
      { x: 0, y: size - 1 },
      { x: size - 1, y: 0 },
      { x: size - 1, y: size - 1 },
    ],
  };

  const pickups = state.pickups.map((pickup) => `${pickup.x}-${pickup.y}`);

  const collision = state.p1.x === state.p2.x && state.p1.y === state.p2.y;
  const p1InPickup = pickups.includes(`${state.p1.x}-${state.p1.y}`);
  const p2InPickup = pickups.includes(`${state.p2.x}-${state.p2.y}`);

  if (collision || p1InPickup || p2InPickup) {
    return init(p1Url, p2Url, size);
  }
};

export const getPlayerPositions = () => {
  return {
    p1: { x: state.p1.x, y: state.p1.y },
    p2: { x: state.p2.x, y: state.p2.y },
  };
};

export const getMinesRemaining = () => {
  return {
    p1: state.p1.minesRemaining,
    p2: state.p2.minesRemaining,
  };
};

export const playTurn = ({ p1, p2, turn, addLog }) => {
  const getCoords = () => {
    const x = parseInt(turn?.x);
    const y = parseInt(turn?.y);

    const invalidNumbers = isNaN(x) || isNaN(y);
    const outOfRange = x < 0 || x > state.size - 1 || y < 0 || y > state.size - 1;

    if (invalidNumbers || outOfRange) {
      return { err: `invalid coords: ${turn?.x},${turn?.y}` };
    }

    return { x, y };
  };

  if (!VALID_TURNS.includes(turn?.action)) {
    return { err: `invalid turn: ${turn?.action}` };
  }

  const playerKey = p1 ? "p1" : "p2";
  const playerName = p1 ? "player 1" : "player 2";

  if (turn.action === TURN_MOVE) {
    const { x, y, err } = getCoords();

    if (err) {
      return { err };
    }

    state[playerKey].x = x;
    state[playerKey].y = y;

    addLog(`${playerName} moved to ${x},${y}`);

    if (state.p1.x === state.p2.x && state.p1.y === state.p2.y) {
      return { p1Won: p1, p2Won: p2 };
    }

    for (let mine of state.mines) {
      if (state[playerKey].x === mine.x && state[playerKey].y === mine.y) {
        addLog(`${playerName} stepped on mine laid by ${mine.laidBy === "p1" ? "player 1" : "player 2"}`);
        return { p1Won: !p1, p2Won: !p2 };
      }
    }

    for (let pickup of state.pickups) {
      if (state[playerKey].x === pickup.x && state[playerKey].y === pickup.y) {
        state[playerKey].minesRemaining += 1;
        addLog(`${playerName} picked up a mine and now has ${state[playerKey].minesRemaining}`);
        break;
      }
    }

    state.pickups = state.pickups.filter((pickup) => {
      return !(pickup.x === state[playerKey].x && pickup.y === state[playerKey].y);
    });

    return {};
  }

  if (turn.action === TURN_LAYMINE) {
    const { x, y, err } = getCoords();

    if (err) {
      return { err };
    }

    if (state[playerKey].minesRemaining <= 0) {
      addLog(`${playerName} tried to lay mine at ${x},${y} but has no mines`);
      return {};
    }

    state[playerKey].minesRemaining -= 1;

    const existingMine = state.mines.find((mine) => mine.x === x && mine.y === y);

    if (existingMine) {
      addLog(`${playerName} laid mine on mine at ${x},${y}, destroying both`);
      state.mines = state.mines.filter((mine) => mine.x !== x && mine.y !== y);
      return {};
    } else {
      state.mines.push({ x, y, laidBy: playerKey });
      addLog(`${playerName} laid mine at ${x},${y}`);
    }

    if (state.p1.x === x && state.p1.y === y) {
      addLog("player 1 destroyed by mine");
      return { p1Won: false, p2Won: true };
    }

    if (state.p2.x === x && state.p2.y === y) {
      addLog("player 2 destroyed by mine");
      return { p1Won: true, p2Won: false };
    }

    return {};
  }

  if (turn.action === TURN_RUNRADAR) {
    addLog(`${playerName} ran radar`);
    return { radar: generateGrid(`radar-${playerKey}`) };
  }
};

export const generateGrid = (mode, winner = null) => {
  const grid = [];

  for (let y = 0; y < state.size; y++) {
    for (let x = 0; x < state.size; x++) {
      if (!grid[y]) {
        grid[y] = [];
      }

      grid[y][x] = "";
    }
  }

  state.pickups?.forEach((pickup) => {
    grid[pickup.y][pickup.x] = "X";
  });

  if (mode === "overview") {
    grid[state.p1.y][state.p1.x] = "1";
    grid[state.p2.y][state.p2.x] = "2";

    if (winner === "p1") {
      grid[state.p1.y][state.p1.x] = "1";
    }
  }

  if (mode === "radar-p1") {
    grid[state.p1.y][state.p1.x] = "Y";
    grid[state.p2.y][state.p2.x] = "T";
  }

  if (mode === "radar-p2") {
    grid[state.p1.y][state.p1.x] = "T";
    grid[state.p2.y][state.p2.x] = "Y";
  }

  if (mode === "initial-p1") {
    grid[state.p1.y][state.p1.x] = "Y";
  }

  if (mode === "initial-p2") {
    grid[state.p2.y][state.p2.x] = "Y";
  }

  state.mines?.forEach((mine) => {
    grid[mine.y][mine.x] = "M";
  });

  return grid;
};

export const renderGrid = (grid, turn) => {
  const lines = [];

  for (let y = 0; y < grid.length; y++) {
    let line = "";

    for (let x = 0; x < grid[y].length; x++) {
      line += grid[y][x] || ".";

      if (x !== grid[y].length - 1) {
        line += " ";
      }
    }

    lines.push(line);
  }

  const title = `Turn: ${turn}`;

  let table = "";

  table += `┌${"─".repeat(grid.length * 2 - 1 + 2)}┐\n`;
  table += `│ ${title}${" ".repeat(grid.length * 2 - title.length)}│\n`;
  table += `├${"─".repeat(grid.length * 2 - 1 + 2)}┤\n`;

  lines.forEach((line) => {
    table += `│ ${line} │\n`;
  });

  table += `└${"─".repeat(grid.length * 2 - 1 + 2)}┘\n`;

  return table;
};
