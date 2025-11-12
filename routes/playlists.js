import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

router.post("/add-track", async (req, res) => {
  const { playlistId, track } = req.body;

  const { error } = await supabase.from("tracks").insert({
    playlist_id: playlistId,
    title: track.title,
    artist: track.artist,
    spotify_id: track.id,
    preview_url: track.previewUrl,
    album_art: track.albumArt,
  });

  if (error) return res.status(500).json({ error });

  res.json({ success: true });
});

export default router;
