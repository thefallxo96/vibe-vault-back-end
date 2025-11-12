import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // if you're using Spotify API

const app = express();

// ✅ Allow CORS for both local dev and Render frontend
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://vibe-vault-frontend.onrender.com",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Fallback CORS header protection
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json());

// ✅ Spotify Token Endpoint
app.get("/api/spotify/token", async (req, res) => {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Spotify Token Error:", err);
    res.status(500).json({ error: "Failed to get token" });
  }
});

// ✅ Example Spotify search endpoint
app.get("/api/spotify/search", async (req, res) => {
  try {
    const { mood } = req.query;
    const tokenResponse = await fetch(
      `${process.env.BACKEND_URL || "https://accounts.spotify.com/api/token"}`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      }
    );

    const { access_token } = await tokenResponse.json();
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${mood}&type=track&limit=10`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const data = await searchResponse.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Spotify Search Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Listen on the correct host and port for Render
const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Spotify token server running on port ${PORT}`);
});
