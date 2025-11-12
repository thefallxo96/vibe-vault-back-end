import express from "express";
import fetch from "node-fetch";
const router = express.Router();

router.get("/token", async (req, res) => {
  try {
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

    const data = await tokenRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Spotify token failed" });
  }
});

export default router;
