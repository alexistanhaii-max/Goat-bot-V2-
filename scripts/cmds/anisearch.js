const { GoatWrapper } = require('fca-liane-utils');
const axios = require('axios');

let API_BASE = null;

// fetch api.json once (cache) → faster next calls
async function getApiBase() {
  if (API_BASE) return API_BASE;
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/Arafat-Core/cmds/refs/heads/main/api.json",
    { timeout: 10000 }
  );
  API_BASE = data.download;
  return API_BASE;
}

async function fetchTikTokStream(query) {
  try {
    const base = await getApiBase();

    const { data } = await axios.get(
      `${base}/tiktok?keyword=${encodeURIComponent(query)}`,
      {
        responseType: "stream",
        timeout: 0,
        headers: { "User-Agent": "Mozilla/5.0" }
      }
    );

    return data;
  } catch {
    return null;
  }
}

const successUI = (name) => `
╭─❖
│ 🎬 𝐀𝐍𝐈𝐌𝐄 𝐄𝐃𝐈𝐓
│ 🔎 ${name}
╰───────────────❖
`;

module.exports = {
  config: {
    name: "anisearch",
    aliases: ["anisr"],
    author: "𝐀𝐫𝐚𝐟𝐚𝐭",
    version: "1.1",
    category: "media"
  },

  onStart: async function ({ api, event, args, usersData }) {

    const COST = 2000;
    const userID = event.senderID;

    const userData = await usersData.get(userID);
    const balance = userData.money || 0;
    if (balance < COST) return;

    await usersData.set(userID, { money: balance - COST });

    api.setMessageReaction("🌿", event.messageID, () => {}, true);

    const query = args.join(" ");
    const videoStream = await fetchTikTokStream(`${query} anime edit`);
    if (!videoStream) return;

    api.setMessageReaction("🕊️", event.messageID, () => {}, true);

    api.sendMessage(
      {
        body: successUI(query),
        attachment: videoStream
      },
      event.threadID,
      event.messageID
    );
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });        
