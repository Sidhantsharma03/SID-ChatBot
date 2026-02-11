# SID ChatBot

A free ChatGPT-style chatbot interface built with plain HTML, CSS, and JavaScript.

## What this project is
SID ChatBot is a **front-end only** chatbot demo:
- No paid API key required
- No backend/database required
- Runs directly in a browser

---

## 1) How to execute (run locally)

### Option A: Python (quickest)
```bash
python3 -m http.server 4173
```
Then open:
- `http://localhost:4173`

### Option B: VS Code Live Server
- Open the project in VS Code
- Install/use **Live Server** extension
- Right click `index.html` → **Open with Live Server**

---

## 2) How to test

### A. JavaScript syntax check
```bash
node --check script.js
```
Expected result: no output and exit code `0`.

### B. Manual functional test
1. Start local server (`python3 -m http.server 4173`)
2. Open `http://localhost:4173`
3. Verify:
   - Welcome message appears
   - Typing and clicking **Send** adds your message
   - Bot shows “SID is typing...” then replies
   - Layout works on mobile width (browser responsive mode)

### C. Quick browser smoke test (optional)
If Playwright is available, automate open + send message + screenshot.

---

## 3) How to use publicly

Because this is static HTML/CSS/JS, you can host it for free.

### Option A: GitHub Pages
1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Source: deploy from `main` branch root
4. Your public URL will look like:
   - `https://<username>.github.io/<repo-name>/`

### Option B: Netlify / Vercel
1. Import the repo
2. Build command: *(none required)*
3. Publish directory: `.`
4. Deploy

### Option C: Expose local network (same Wi-Fi)
Run:
```bash
python3 -m http.server 4173 --bind 0.0.0.0
```
Then share:
- `http://<your-local-ip>:4173`

> Note: this is still a local machine host, not internet-grade production hosting.

---

## Project files
- `index.html` — app layout
- `style.css` — visual styles
- `script.js` — chatbot interaction logic
