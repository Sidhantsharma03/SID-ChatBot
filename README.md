# SID ChatBot

SID ChatBot is a backend-powered chatbot.
Frontend sends your message to `/api/chat`, and backend calls **OpenAI Chat Completions (ChatGPT)**.

## User request update
✅ Gemini/OpenRouter हटाया गया. अब direct ChatGPT API (`OPENAI_API_KEY`) use हो रहा है.

---

## Quick setup (Windows PowerShell)
1. Open terminal in project folder.
2. Set OpenAI key in current terminal:
   ```powershell
   $env:OPENAI_API_KEY="your_openai_key"
   ```
3. (Optional) set model:
   ```powershell
   $env:OPENAI_MODEL="gpt-4o-mini"
   ```
4. Start server:
   ```powershell
   node server.js
   ```
5. Open:
   - `http://localhost:4173`

> `setx` works only in a new terminal. For instant use, prefer `$env:...`.

---

## `.env` option
Create `.env` in project root:
```env
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
```
Then run:
```bash
node server.js
```

---

## Common errors and fix

### 1) `Missing OPENAI_API_KEY`
Set key and restart server.

### 2) `quota / rate limit`
Your OpenAI quota or billing limit is hit.
- Check usage/billing in OpenAI dashboard
- Retry after cooldown

### 3) JSON parse / HTML response
You likely ran app on static server (like Live Server 5500). Use backend URL:
- `http://localhost:4173`

---

## What can you ask?
- `Hi`
- `Mujhe DSA roadmap do`
- `Python calculator code do`
- `Create business ideas for students`
- `Interview me self introduction ka template do`

---

## Basic tests
### Syntax
```bash
node --check server.js
node --check script.js
```

### API (PowerShell)
```powershell
Invoke-RestMethod -Uri http://localhost:4173/api/chat -Method Post -ContentType 'application/json' -Body '{"message":"Hi"}'
```

### API (bash/curl)
```bash
curl -s -X POST http://localhost:4173/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi"}'
```

---

## Public deploy
Deploy to Node platform (Render/Railway/Fly/VPS), set:
- `OPENAI_API_KEY`
- optional `OPENAI_MODEL`

Do not expose API key in frontend JavaScript.
