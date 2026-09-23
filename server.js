const express = require('express');
const cors = require('cors');

const app = express();

// CORS for all origins & headers
app.use(cors());
app.use(express.json());

// Telegram Bot Credentials
const BOT_TOKEN = '8906098215:AAF_SkcJa67Y7rW_73G7zvUxUhUNwE1DZm8';
const ADMIN_CHAT_ID = '7603706655';

// Memory Store for Approved Game IDs
const approvedUsers = new Set();

// 1. Root Test Route
app.get('/', (req, res) => {
    res.send("VeerGame Backend Active & Working!");
});

// 2. Web App Access Request Route
app.post('/request-access', async (req, res) => {
    const { gameId } = req.body;
    if (!gameId) {
        return res.status(400).json({ success: false, message: "Game ID missing" });
    }

    const cleanId = String(gameId).trim();
    console.log(`[REQUEST] Access requested for Game ID: ${cleanId}`);

    // Direct Link to Approve easily via Telegram
    const approveUrl = `https://veergame-backend-1.onrender.com/approve-user?gameId=${cleanId}`;
    const textMessage = `🚨 *New Access Request!*\n\n🎮 *Game ID:* \`${cleanId}\`\n\n👇 Click to Approve:\n${approveUrl}`;

    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: textMessage,
                parse_mode: 'Markdown'
            })
        });
    } catch (error) {
        console.error("Telegram error:", error);
    }

    res.json({ success: true, message: "Request sent to Admin!" });
});

// 3. Approval Check Route (Web app checks status)
app.get('/check-approval', (req, res) => {
    const gameId = req.query.gameId;
    if (!gameId) {
        return res.json({ approved: false });
    }

    const cleanId = String(gameId).trim();
    const isApproved = approvedUsers.has(cleanId);
    
    console.log(`[CHECK] Game ID: ${cleanId} -> Approved: ${isApproved}`);
    res.json({ approved: isApproved });
});

// 4. Admin Direct Approval Endpoint
app.get('/approve-user', (req, res) => {
    const gameId = req.query.gameId;
    if (gameId) {
        const cleanId = String(gameId).trim();
        approvedUsers.add(cleanId);
        console.log(`[APPROVED] Game ID ${cleanId} added to memory!`);
        return res.send(`<h2>✅ Success! Game ID <b>${cleanId}</b> Approved Successfully!</h2><p>Terminal will unlock automatically now.</p>`);
    }
    res.status(400).send("Error: Game ID missing");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
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
