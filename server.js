import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

// ✅ 1️⃣ Spotify Token Endpoint (for testing or frontend use)
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

// ✅ 2️⃣ Spotify Search Endpoint (Shuffle + Fallback)
app.get("/api/spotify/search", async (req, res) => {
  const { mood } = req.query;
  if (!mood) return res.status(400).json({ error: "Missing mood parameter" });

  try {
    // Request Spotify access token
    const auth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

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

    // Search Spotify for tracks
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        mood + " playlist music"
      )}&type=track&market=US&limit=40`,
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const searchData = await searchRes.json();
    console.log("🟢 Spotify raw tracks:", searchData.tracks?.items?.slice(0, 3));


    // Map playable tracks only
    const playableTracks =
      searchData.tracks?.items
        ?.filter((t) => t.preview_url || t.id)
        ?.map((t) => ({
          id: t.id,
          title: t.name,
          artist: t.artists.map((a) => a.name).join(", "),
          albumArt: t.album.images?.[0]?.url,
          previewUrl: t.preview_url,
        })) || [];

    // Shuffle the list randomly and select up to 10
    const shuffled = playableTracks.sort(() => 0.5 - Math.random());
    const finalTracks = shuffled.slice(0, 10);

    // Fallback if no Spotify previews exist
    if (finalTracks.length === 0) {
      console.warn(`⚠️ No Spotify previews for mood "${mood}", using fallback.`);
      return res.json([
        {
          id: "local-default",
          title: "Which One (DJ Yonny Remix)",
          artist: "Drake & Central Cee",
          albumArt: "/album-art.jpg",
          previewUrl: "/which-one-dirty-remix.mp3",
        },
      ]);
    }

    res.json(finalTracks);
  } catch (err) {
    console.error("❌ Spotify Search Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ 3️⃣ Start the server
app.listen(PORT, () => {
  console.log(`✅ Spotify token server running on port ${PORT}`);
});
