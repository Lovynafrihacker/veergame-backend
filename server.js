const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));
app.use(express.json());

const BOT_TOKEN = '8906098215:AAF_SkcJa67Y7rW_73G7zvUxUhUNwE1DZm8';
const ADMIN_CHAT_ID = '7603706655';

// Memory Store for Approved Game IDs
const approvedUsers = new Set();

// 1. Root Test Route
app.get('/', (req, res) => {
    res.send("VeerGame Backend Active!");
});

// 2. Request Access Route
app.post('/request-access', async (req, res) => {
    try {
        const { gameId } = req.body;
        if (!gameId) {
            return res.status(400).json({ success: false, message: "Game ID missing" });
        }

        const cleanId = String(gameId).trim().toLowerCase();
        console.log(`[NEW REQUEST] Game ID: ${cleanId}`);

        const approveUrl = `https://veergame-backend-1.onrender.com/approve-user?gameId=${cleanId}`;
        const messageText = `🚨 *New Access Request!*\n\n🎮 *Game ID:* \`${cleanId}\`\n\n👇 Click below link to Approve:\n${approveUrl}`;

        // Telegram Message Send
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: messageText,
                parse_mode: 'Markdown'
            })
        });

        return res.json({ success: true, message: "Request sent to Admin!" });
    } catch (err) {
        console.error("Request access error:", err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 3. Approval Check Route (Web App Polling)
app.get('/check-approval', (req, res) => {
    const gameId = req.query.gameId;
    if (!gameId) {
        return res.json({ approved: false });
    }

    const cleanId = String(gameId).trim().toLowerCase();
    const isApproved = approvedUsers.has(cleanId);
    
    console.log(`[CHECK] Game ID: ${cleanId} | Approved: ${isApproved}`);
    return res.json({ approved: isApproved });
});

// 4. Approve User Route (Admin Link Click)
app.get('/approve-user', (req, res) => {
    const gameId = req.query.gameId;
    if (gameId) {
        const cleanId = String(gameId).trim().toLowerCase();
        approvedUsers.add(cleanId);
        console.log(`[SUCCESS] Game ID ${cleanId} Approved!`);
        return res.send(`
            <div style="text-align: center; font-family: sans-serif; padding: 50px;">
                <h1 style="color: #2e7d32;">✅ Game ID ${cleanId} Approved Successfully!</h1>
                <p>Web Terminal will now unlock automatically within 2 seconds.</p>
            </div>
        `);
    }
    return res.status(400).send("Game ID missing");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
