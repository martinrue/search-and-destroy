import { move, layMine, runRadar } from "./turns.js";
import { readRadar } from "./radar.js";

const state = {
  gridSize: 0,
  position: null,
  opponent: null,
  opponentUsedRadar: false,
  mineRemaining: 3,
  mines: [],
};

export const start = ({ radar }) => {
  const result = readRadar(radar);
  state.gridSize = result.gridSize;
  state.position = result.position;
};

export const turn = ({ minesRemaining, opponentUsedRadar }) => {
  state.minesRemaining = minesRemaining;
  state.opponentUsedRadar = opponentUsedRadar;

  state.position.x += 1;

  if (state.position.x >= state.gridSize) {
    state.position.x = 0;
    state.position.y += 1;
  }

  if (state.position.y >= state.gridSize) {
    state.position.x = 0;
    state.position.y = 0;
  }

  return move(state.position.x, state.position.y);
};

export const handleRadar = ({ radar }) => {
  const result = readRadar(radar);
  state.opponent = result.opponent;
  state.mines = result.mines;
};

export const stop = ({ result, turns }) => {
  console.log(`${result} after ${turns} turns`);
};
