const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// Allow Roblox HttpService to connect
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Simple function to fetch inventory pages
async function fetchInventory(userId, cursor = "") {
    const url = `https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?limit=100&cursor=${cursor}`;
    const { data } = await axios.get(url);
    return data;
}

async function calculateValue(userId) {
    let total = 0;
    let cursor = "";

    // Loop through inventory pages
    while (true) {
        const data = await fetchInventory(userId, cursor);

        for (const item of data.data) {
            if (item.recentAveragePrice) {
                total += item.recentAveragePrice; // Limited value
            }
        }

        if (!data.nextPageCursor) break;
        cursor = data.nextPageCursor;
    }
    return total;
}

app.post("/value", async (req, res) => {
    const userId = req.body.userId;

    if (!userId) return res.json({ error: "No user id." });

    try {
        const value = await calculateValue(userId);
        res.json({ value });
    } catch (err) {
        res.json({ error: "Failed to get inventory." });
    }
});

app.listen(3000, () => {
    console.log("API Running on port 3000");
});
