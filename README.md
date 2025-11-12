## VibeVault — Backend API

The VibeVault backend powers authentication, API handling, and all communication between the frontend, Supabase, and external music services like Spotify/Apple. Built with Node.js and Express, this backend currently focuses on auth + external API interaction — with no user-managed database yet.

🚀 Live API

https://vibe-vault-back-end.onrender.com

📦 Tech Stack

Node.js

Express.js

CORS

Axios / Fetch

Supabase Auth (Google, Apple, Spotify capable)

Render Deployment

🧩 Features

Handles Supabase authentication tokens

OAuth-ready (Google / Apple / Spotify)

Acts as a secure layer between frontend ↔ external music APIs

Routes for testing, fetching music, retrieving user session info

No internal database yet (future MongoDB integration optional)

📁 Project Structure
/routes
/controllers
/server.js

🔧 Installation
git clone https://github.com/YOUR-USERNAME/vibevault-backend.git
cd vibevault-backend
npm install
npm run dev

🔐 Environment Variables

Create a .env file:

PORT=4000

# Supabase Auth Keys
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=

# OAuth Keys (future)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=


Since there is no database yet, you do NOT need MONGODB_URI or any DB connection.

📡 API Endpoints
Auth Handling
POST /auth/validate
POST /auth/google
POST /auth/apple
POST /auth/spotify

Music Routes (future)
GET /spotify/search
GET /spotify/track/:id
GET /apple/song/:id

Root
GET /

🚀 Deployment on Render

Push repo to GitHub

Create a new Web Service on Render

Build command:

npm install


Start command:

node server.js


Add all environment variables under “Environment” section

Deploy

📝 License

MIT License.
