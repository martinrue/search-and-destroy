export const move = (x, y) => ({ action: "MOVE", x, y });
export const layMine = (x, y) => ({ action: "LAYMINE", x, y });
export const runRadar = () => ({ action: "RUNRADAR" });
