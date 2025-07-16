# Problem 3: Google Calendar Integration Without WebSockets or BaaS

## 🧠 Design Overview

This solution provides a real-time view of your Google Calendar events using:

- **React Frontend** (`client/CalendarApp.jsx`)  
  - Initiates OAuth2 login  
  - Periodically polls the backend for event changes  
  - Renders the event list and “Login” button as needed

- **Express Backend** (`server/calendarWebhook.js`)  
  - Exposes `/auth-url` to generate the Google OAuth URL  
  - Handles the OAuth2 callback on `/oauth2callback` and stores tokens  
  - Serves `/events`, using Google’s incremental sync with `syncToken`  
  - Automatically recovers when a `syncToken` expires (HTTP 410 → refetch)

## 📂 Repository Structure

problem-3/
├── client/
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── CalendarApp.jsx
│ │ ├── App.js
│ │ └── index.js
│ └── package.json
├── server/
│ ├── calendarWebhook.js
│ ├── package.json
│ └── .env
└── .gitignore


## ⚙️ Prerequisites

- Node.js v14+  
- A Google Cloud project with:
  - **Calendar API** enabled  
  - **OAuth consent screen** configured (External, in Testing mode, with your Gmail as a Test User)  
  - OAuth 2.0 **Client ID** & **Client Secret**

## 🔧 Configuration

1. In `problem-3/server/.env`, add:
CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

## 🚀 How to Run
1. Start the Backend
bash
Copy
Edit
cd problem-3/server
npm install
npm start
Server listens on http://localhost:5000

## Endpoints:

- GET /auth-url → returns { url } for OAuth2 login

- GET /oauth2callback?code=… → Google redirects here post-login

- GET /events → returns { items: [ … ], nextSyncToken: "…" } or 401 if not authenticated

2. Start the Frontend
bash
Copy
Edit
cd problem-3/client
npm install
npm start
Frontend runs on http://localhost:3000

Open in your browser, click “Login with Google”, grant permissions, then watch your calendar events appear and update every 10 seconds.

## 🔄 Incremental Sync Logic
- On first /events call: fetch all upcoming events since now

- Store the returned nextSyncToken

- On subsequent calls: include syncToken to fetch only changes

- If Google returns HTTP 410 (invalid/expired syncToken), clear it and do a full sync again

## 📌 Trade-offs & Limitations
Polling Interval is fixed at 10 s — very responsive but uses more quota.

Token Storage is in-memory; the server must stay running or users must re-login after restart.

No Webhooks: we rely on polling, not Google’s push notifications (to avoid requiring a public HTTPS endpoint).

Browser Testing Mode: app is in “Testing” on Google Cloud, so only added Test Users can sign in.

✅ Status
✅ OAuth2 login flow implemented

✅ Calendar event fetching & incremental sync working

✅ React UI dynamically renders event changes

✅ Automated recovery from expired sync tokens