# SID ChatBot

SID ChatBot is now a **real backend-powered chatbot**.
It sends your message to **Google Gemini API** and returns actual AI answers (not hardcoded templates).

## What changed
- Frontend sends messages to `/api/chat`
- Backend (`server.js`) calls Gemini model
- Google Search tool is enabled in request tools so model can use fresher web info when needed

---

## 1) Setup

### Requirements
- Node.js 18+
- Gemini API key from Google AI Studio

### Set API key
Linux/macOS:
```bash
export GEMINI_API_KEY="your_api_key_here"
```

Windows (PowerShell):
```powershell
setx GEMINI_API_KEY "your_api_key_here"
```

Optional model override:
```bash
export GEMINI_MODEL="gemini-2.0-flash"
```

---

## 2) Run (execute)

```bash
node server.js
```
Open:
- `http://localhost:4173`

---

## 3) Test

### A) Syntax checks
```bash
node --check server.js
node --check script.js
```

### B) API route test (without key)
```bash
curl -s -X POST http://localhost:4173/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}'
```
Expected: JSON error telling you to set `GEMINI_API_KEY`.

### C) Real answer test (with key set)
```bash
curl -s -X POST http://localhost:4173/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi I am Sidhant, explain recursion simply"}'
```
Expected: real generated answer from Gemini.

---

## 4) Public deploy

Because this now has a backend, deploy to a Node host:

### Option A: Render / Railway / Fly.io
- Deploy repo
- Start command: `node server.js`
- Add environment variable: `GEMINI_API_KEY`
- (Optional) `GEMINI_MODEL`

### Option B: VPS
```bash
node server.js
```
Then use Nginx/Caddy reverse proxy and HTTPS.

> Do not expose API key in frontend JavaScript.

---

## Project files
- `index.html` — chat UI
- `style.css` — styles
- `script.js` — frontend chat client (calls backend)
- `server.js` — backend API + static server
