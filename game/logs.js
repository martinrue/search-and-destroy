const logs = [];

export const add = (turn, msg) => {
  logs.push({ turn, msg });
};

export const getLast = (amount) => {
  return logs.slice(Math.max(logs.length - amount, 0));
};

export const getAll = () => {
  return logs;
};
