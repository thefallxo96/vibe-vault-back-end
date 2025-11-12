import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
app.use(express.json());

const PORT = process.env.PORT || 5001;

// ✅ Spotify Token Endpoint (optional but useful for testing)
app.get("/api/spotify/token", async (req, res) => {
  try {
    const auth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const data = await tokenResponse.json();
    return res.json(data);
  } catch (err) {
    console.error("❌ Spotify Token Error:", err);
    return res.status(500).json({ error: "Failed to fetch Spotify token" });
  }
});

// ✅ Spotify Search Endpoint (playable fallback)
app.get("/api/spotify/search", async (req, res) => {
  const { mood } = req.query;
  if (!mood) return res.status(400).json({ error: "Missing mood parameter" });

  try {
    const auth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    // Get token
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token)
      return res.status(500).json({ error: "Failed to get token" });

    // Search Spotify
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        mood + " playlist music"
      )}&type=track&market=US&limit=40`,
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const searchData = await searchRes.json();
    const items = searchData.tracks?.items || [];

    // Map playable tracks with fallback preview
    const playableTracks = items.map((t) => ({
      id: t.id,
      title: t.name,
      artist: t.artists.map((a) => a.name).join(", "),
      albumArt: t.album.images?.[0]?.url,
      previewUrl: t.preview_url || "/which-one-dirty-remix.mp3",
    }));

    // Shuffle and return up to 10
    const shuffled = playableTracks.sort(() => 0.5 - Math.random()).slice(0, 10);
    res.json(shuffled);
  } catch (err) {
    console.error("❌ Spotify Search Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// ✅ Serve frontend build if deployed together
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  const clientPath = path.resolve(__dirname, "../vibe-vault-front-end/build");
  app.use(express.static(clientPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`✅ Spotify token server running on port ${PORT}`);
});
