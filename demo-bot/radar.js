const YOU = "Y";
const THEM = "T";
const MINE = "M";

export const readRadar = (grid) => {
  const gridSize = grid.length;
  let position = null;
  let opponent = null;
  let mines = [];

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const value = grid[y][x];

      if (value === YOU) {
        position = { x, y };
      }

      if (value === THEM) {
        opponent = { x, y };
      }

      if (value === MINE) {
        mines.push({ x, y });
      }
    }
  }

  return {
    gridSize,
    position,
    opponent,
    mines,
  };
};
