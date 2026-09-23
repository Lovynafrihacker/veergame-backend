const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Memory store for approvals
const approvedUsers = new Set();

// 1. Root Test Route (Fixes 'Cannot GET /')
app.get('/', (req, res) => {
    res.send("VeerGame Backend Server Active & Ready!");
});

// 2. Request Access Route
app.post('/request-access', (req, res) => {
    const { gameId } = req.body;
    if (!gameId) {
        return res.status(400).json({ success: false, message: "Game ID missing" });
    }
    console.log(`New approval request for Game ID: ${gameId}`);
    res.json({ success: true, message: "Request received" });
});

// 3. Approval Check Route (Web Terminal har 2-3 sec me check karega)
app.get('/check-approval', (req, res) => {
    const gameId = req.query.gameId;
    if (gameId && approvedUsers.has(String(gameId))) {
        return res.json({ approved: true });
    }
    res.json({ approved: false });
});

// 4. Admin / Bot Approve User Route
app.post('/approve-user', (req, res) => {
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
