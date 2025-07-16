require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'http://localhost:5000/oauth2callback'
);

// Token & SyncToken management
let token = null;
const TOKEN_PATH = path.join(__dirname, 'sync-token.txt');
let syncToken = fs.existsSync(TOKEN_PATH) ? fs.readFileSync(TOKEN_PATH, 'utf8') : null;

// Step 1: Get Google OAuth URL
app.get('/auth-url', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly']
  });
  res.json({ url });
});

// Step 2: OAuth2 callback
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  token = tokens;
  res.redirect('http://localhost:3000');
});

// Step 3: Events endpoint
app.get('/events', async (req, res) => {
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  oAuth2Client.setCredentials(token);
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  try {
    const params = {
      calendarId: 'primary',
      singleEvents: true,
      orderBy: 'startTime',
    };

    if (syncToken) {
      params.syncToken = syncToken;
    } else {
      params.timeMin = new Date().toISOString();
    }

    const response = await calendar.events.list(params);

    if (response.data.nextSyncToken) {
      syncToken = response.data.nextSyncToken;
      fs.writeFileSync(TOKEN_PATH, syncToken, 'utf8');
    }

    res.json(response.data);
  } catch (err) {
    if (err.code === 410) {
      // Invalid syncToken – clear and refetch from scratch
      syncToken = null;
      if (fs.existsSync(TOKEN_PATH)) fs.unlinkSync(TOKEN_PATH);
      return res.redirect('/events');
    }
    console.error(err);
    res.status(500).send('Failed to fetch events');
  }
});

// Optional: Reset sync manually
app.get('/reset-sync', (req, res) => {
  syncToken = null;
  if (fs.existsSync(TOKEN_PATH)) fs.unlinkSync(TOKEN_PATH);
  res.send('✅ Sync token reset');
});

// Start server
app.listen(5000, () => {
  console.log('✅ Server running at http://localhost:5000');
});
