const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const BOT_TOKEN = '8906098215:AAF_SkcJa67Y7rW_73G7zvUxUhUNwE1DZm8';
const ADMIN_CHAT_ID = '7603706655';

const DB_FILE = path.join(__dirname, 'approved.json');

// Helper Function: Read Approved IDs from File
function getApprovedList() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (e) {
        return [];
    }
}

// Helper Function: Save Approved ID to File
function saveApprovedId(gameId) {
    const list = getApprovedList();
    const cleanId = String(gameId).trim().toLowerCase();
    if (!list.includes(cleanId)) {
        list.push(cleanId);
        fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2));
    }
}

// 1. Root Test Route
app.get('/', (req, res) => {
    res.send("VeerGame Backend Active & File Database Ready!");
});

// 2. Request Access Route
app.post('/request-access', async (req, res) => {
    try {
        const { gameId } = req.body;
        if (!gameId) {
            return res.status(400).json({ success: false, message: "Game ID missing" });
        }

        const cleanId = String(gameId).trim().toLowerCase();
        console.log(`[REQUEST] Access requested for Game ID: ${cleanId}`);

        const approveUrl = `https://veergame-backend-1.onrender.com/approve-user?gameId=${cleanId}`;
        const messageText = `🚨 *New Access Request!*\n\n🎮 *Game ID:* \`${cleanId}\`\n\n👇 Click to Approve:\n${approveUrl}`;

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
        console.error("Telegram Send Error:", err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 3. Approve User Route (Saves ID to File)
app.get('/approve-user', (req, res) => {
    const gameId = req.query.gameId;
    if (gameId) {
        const cleanId = String(gameId).trim().toLowerCase();
        
        // File me ID save karein
        saveApprovedId(cleanId);
        console.log(`[SAVED TO FILE] Game ID ${cleanId} approved!`);

        return res.send(`
            <div style="text-align: center; font-family: sans-serif; padding: 40px; background: #0d1117; color: #58a6ff;">
                <h1 style="color: #7ee787;">✅ Game ID ${cleanId} Approved Successfully!</h1>
                <p style="color: #fff; font-size: 18px;">Your Web Terminal will unlock within 2 seconds.</p>
            </div>
        `);
    }
    return res.status(400).send("Game ID missing");
});

// 4. Check Approval Route (Reads ID from File)
app.get('/check-approval', (req, res) => {
    const gameId = req.query.gameId;
    if (!gameId) {
        return res.json({ approved: false });
    }

    const cleanId = String(gameId).trim().toLowerCase();
    const list = getApprovedList();
    const isApproved = list.includes(cleanId);

    console.log(`[CHECK FILE] Game ID: ${cleanId} | Approved: ${isApproved}`);
    return res.json({ approved: isApproved });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
