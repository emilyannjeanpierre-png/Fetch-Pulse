# 🔥 Fetch Consumer Culture Pulse — Deploy Guide

A weekly AI-powered trend report tool for Leadership, Marketing, and Consumer Insights.

---

## What's included

| File | Purpose |
|------|---------|
| `index.html` | The full web app UI |
| `api/pulse.js` | Serverless backend (calls Anthropic API securely) |
| `vercel.json` | Vercel config |

---

## Deploy in 5 steps (~2 minutes)

### 1. Get a free Vercel account
Go to [vercel.com](https://vercel.com) and sign up (free tier is fine).

### 2. Install Vercel CLI
```bash
npm install -g vercel
```

### 3. Drop these 3 files into a folder
```
fetch-pulse/
  index.html
  vercel.json
  api/
    pulse.js
```

### 4. Deploy
```bash
cd fetch-pulse
vercel --prod
```
Follow the prompts — takes about 60 seconds.

### 5. Add your Anthropic API key
In the Vercel dashboard:
- Go to your project → **Settings** → **Environment Variables**
- Add: `ANTHROPIC_API_KEY` = your key from [console.anthropic.com](https://console.anthropic.com)
- Hit **Redeploy** (one click in the dashboard)

✅ Done — you'll get a live URL like `https://fetch-pulse.vercel.app`

---

## Share with your team
Send anyone at Fetch the URL. No login required (add Vercel password protection if you want it gated).

---

## Updating the report format
Edit `api/pulse.js` — the prompt is clearly commented and easy to modify.
