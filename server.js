const express = require("express");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");

const app = express();

// Enable CORS & JSON Body Parsing
app.use(cors());
app.use(express.json());

// Telegram Credentials Setup
const BOT_TOKEN = "8906098215:AAF_SkcJa67Y7rW_73G7zvUxUhUNwE1DZm8"; 
const ADMIN_CHAT_ID = "7603706655"; 

// Initialize Telegram Bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Temporary Database (In-Memory Object)
const db = {};

// Root Test Route
app.get("/", (req, res) => {
  res.send("VeerGame Backend Server Running Successfully!");
});

/**
 * 1. API Endpoint: Website Request bhejti hai Verification ke liye
 */
app.post("/api/request-access", (req, res) => {
  const { gameId } = req.body;

  if (!gameId) {
    return res.status(400).json({ success: false, error: "Game ID required" });
  }

  // ID Status PENDING mark karein
  db[gameId] = "PENDING";

  // Telegram Alert Message
  const msgText = `⚠️ <b>NEW ID VERIFICATION REQUEST</b>\n\n` +
                  `<b>Game ID:</b> <code>${gameId}</code>\n\n` +
                  `<i>Agent Panel me check karein ki ₹300 Deposit hua hai ya nahi, uske baad button dabayein:</i>`;

  // Approve & Reject Inline Buttons
  const options = {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Approve & Unlock", callback_data: `approve_${gameId}` },
          { text: "❌ Reject", callback_data: `reject_${gameId}` }
        ]
      ]
    }
  };

  // Telegram Par Message Bhejo
  bot.sendMessage(ADMIN_CHAT_ID, msgText, options)
    .then(() => {
      res.json({ success: true, message: "Verification Request Sent to Admin", gameId });
    })
    .catch((err) => {
      console.error("Telegram Error:", err.message);
      res.status(500).json({ success: false, error: "Failed to notify admin via Telegram" });
    });
});

/**
 * 2. API Endpoint: Website Status Check karti hai (Polling)
 */
app.get("/api/check-status", (req, res) => {
  const { gameId } = req.query;

  if (!gameId) {
    return res.status(400).json({ error: "Game ID parameter missing" });
  }

  const status = db[gameId] || "LOCKED";
  res.json({ gameId, status });
});

/**
 * 3. Telegram Bot Callback Handler: Approve/Reject Button click handle karna
 */
bot.on("callback_query", (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;

  if (data.startsWith("approve_")) {
    const targetGameId = data.split("_")[1];
    db[targetGameId] = "APPROVED";

    bot.answerCallbackQuery(query.id, { text: `Game ID ${targetGameId} Approved!` });

    bot.editMessageText(
      `✅ <b>ID APPROVED!</b>\n\nGame ID: <code>${targetGameId}</code>\n\n<b>Status:</b> Prediction Automatically Unlocked on Website.`,
      {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "HTML"
      }
    );

  } else if (data.startsWith("reject_")) {
    const targetGameId = data.split("_")[1];
    db[targetGameId] = "REJECTED";

    bot.answerCallbackQuery(query.id, { text: `Game ID ${targetGameId} Rejected!` });

    bot.editMessageText(
      `❌ <b>ID REJECTED!</b>\n\nGame ID: <code>${targetGameId}</code>\n\n<b>Status:</b> Verification Failed.`,
      {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "HTML"
      }
    );
  }
});

// Port Configuration for Render.com
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
