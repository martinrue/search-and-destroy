import fetch from "node-fetch";

export const post = async (url, body, parseJSON = true) => {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.status !== 200) {
    throw new Error(`unexpected ${res.status} response`);
  }

  if (parseJSON) {
    return await res.json();
  }
};
