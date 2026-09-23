const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Telegram Bot Details
const BOT_TOKEN = '8906098215:AAF_SkcJa67Y7rW_73G7zvUxUhUNwE1DZm8';
const ADMIN_CHAT_ID = '7603706655';

// Memory Store for Approvals
const approvedUsers = new Set();

// 1. Root Test Route (Fixes 'Cannot GET /')
app.get('/', (req, res) => {
    res.send("VeerGame Backend Server Active & Ready!");
});

// 2. Web App Access Request Route (Sends Telegram Message)
app.post('/request-access', async (req, res) => {
    const { gameId } = req.body;
    if (!gameId) {
        return res.status(400).json({ success: false, message: "Game ID missing" });
    }

    console.log(`[REQUEST] Access requested for Game ID: ${gameId}`);

    // Direct Telegram API Call
    try {
        const textMessage = `🚨 *New Access Request Received!*\n\n🎮 *Game ID:* \`${gameId}\`\n\nTo approve this user, send command:\n\`/approve ${gameId}\``;
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        
        await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: textMessage,
                parse_mode: 'Markdown'
            })
        });
    } catch (error) {
        console.error("Telegram send error:", error);
    }

    res.json({ success: true, message: "Request sent to Telegram Admin!" });
});

// 3. Approval Check Route (Web app checks status)
app.get('/check-approval', (req, res) => {
    const gameId = req.query.gameId;
    if (gameId && approvedUsers.has(String(gameId))) {
        return res.json({ approved: true });
    }
    res.json({ approved: false });
});

// 4. Admin Approval Endpoint (Hit to Approve ID)
app.all('/approve-user', (req, res) => {
    const gameId = req.query.gameId || req.body.gameId;
    if (gameId) {
        approvedUsers.add(String(gameId));
        console.log(`[APPROVED] Game ID ${gameId} approved!`);
        return res.send(`✅ Success! Game ID ${gameId} is now Approved! You can now use the terminal.`);
    }
    res.status(400).send("Error: Game ID missing");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    if (bot && ADMIN_CHAT_ID) {
        try {
            await bot.sendMessage(
                ADMIN_CHAT_ID, 
                `🚨 *New Access Request Received!*\n\n🎮 *Game ID:* \`${gameId}\`\n\nClick below to approve or reject:`, 
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "✅ Approve", callback_data: `approve_${gameId}` },
                                { text: "❌ Reject", callback_data: `reject_${gameId}` }
                            ]
                        ]
                    }
                }
            );
        } catch (error) {
            console.error("Failed to send Telegram message:", error.message);
        }
    }

    res.json({ success: true, message: "Request sent to Admin Bot!" });
});

// Telegram Bot Button Click Handler (Approve / Reject Action)
if (bot) {
    bot.on('callback_query', async (query) => {
        const data = query.data;
        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;

        if (data.startsWith('approve_')) {
            const gameId = data.replace('approve_', '');
            approvedUsers.add(String(gameId));
            
            await bot.editMessageText(`✅ *Game ID ${gameId} HAS BEEN APPROVED!*`, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown'
            });
            await bot.answerCallbackQuery(query.id, { text: `User ${gameId} Approved!` });
            
        } else if (data.startsWith('reject_')) {
            const gameId = data.replace('reject_', '');
            approvedUsers.delete(String(gameId));

            await bot.editMessageText(`❌ *Game ID ${gameId} WAS REJECTED!*`, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown'
            });
            await bot.answerCallbackQuery(query.id, { text: `User ${gameId} Rejected!` });
        }
    });

    // Start Command Response
    bot.onText(/\/start/, (msg) => {
        bot.sendMessage(msg.chat.id, `👋 Hello Admin! VeerGame System is active.\nYour Chat ID: \`${msg.chat.id}\``, { parse_mode: 'Markdown' });
    });
}

// 3. Web App Approval Polling Route
app.get('/check-approval', (req, res) => {
    const gameId = req.query.gameId;
    if (gameId && approvedUsers.has(String(gameId))) {
        return res.json({ approved: true });
    }
    res.json({ approved: false });
});

// 4. Admin Manual Approval Endpoint
app.post('/approve-user', (req, res) => {
    const { gameId } = req.body;
    if (gameId) {
        approvedUsers.add(String(gameId));
        console.log(`[APPROVED] Game ID ${gameId} approved!`);
        return res.json({ success: true, message: `Game ID ${gameId} approved` });
    }
    res.status(400).json({ success: false, message: "Invalid Game ID" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    const { gameId } = req.body;
    if (gameId) {
        approvedUsers.add(String(gameId));
        console.log(`Game ID ${gameId} approved!`);
        return res.json({ success: true, message: `Game ID ${gameId} approved` });
    }
    res.status(400).json({ success: false, message: "Invalid ID" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
