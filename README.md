# AgriDome Lite

A Progressive Web App (PWA) for Nigerian smallholder greenhouse farmers, built with Next.js + Tailwind + shadcn/ui. Features offline-first architecture, Claude AI integration, and a West African-inspired design.

## Features

| Feature | Description |
|---|---|
| **Climate Tracker** | Manual log of temperature, humidity, CO₂, light with chart history |
| **Crop Guide** | 6 crops (tomato, pepper, cucumber, lettuce, spinach, okra) with growth stage tracker |
| **Pest Scanner** | Photo upload + Claude Vision for pest/disease identification |
| **Yield Predictor** | Area/plant-count based yield and revenue calculator |
| **AI Advisor** | Claude-powered chat with Nigerian farming context, 4 languages |
| **Offline Mode** | All data stored in localStorage, works without internet |

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Recharts
- **Backend**: FastAPI on Render, Anthropic Claude API
- **PWA**: next-pwa, Web App Manifest
- **Design**: Dark forest green + gold, Fraunces serif + Instrument Sans

## Quick Start

### Frontend

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
uvicorn main:app --reload
```

## Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com`
4. Deploy

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Root directory: `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Set env var: `ANTHROPIC_API_KEY=sk-ant-...`
6. Set env var: `ALLOWED_ORIGINS=https://your-vercel-app.vercel.app`

Or use the included `backend/render.yaml` for Render Blueprint deployment.

## Language Support

The AI advisor responds in:
- **English** (default)
- **Igbo** (Southeastern Nigeria)
- **Hausa** (Northern Nigeria)
- **Yoruba** (Southwestern Nigeria)

## Crops Covered

| Crop | Days to Harvest | Yield/m² | Optimal Temp |
|---|---|---|---|
| 🍅 Tomato | 75 days | 8 kg | 21–27°C |
| 🫑 Bell Pepper | 85 days | 6 kg | 20–26°C |
| 🥒 Cucumber | 55 days | 12 kg | 24–30°C |
| 🥬 Lettuce | 45 days | 4 kg | 15–22°C |
| 🌿 Spinach | 40 days | 3 kg | 15–20°C |
| 🌱 Okra | 60 days | 2 kg | 25–35°C |

## Project Structure

```
agridome-lite/
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # Feature components
│   └── lib/           # Utilities, storage, crop data
├── public/            # Manifest, icons
├── backend/           # FastAPI service
└── vercel.json        # Vercel config
```

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Frontend | URL of FastAPI backend |
| `ANTHROPIC_API_KEY` | Backend | Anthropic API key |
| `ALLOWED_ORIGINS` | Backend | Comma-separated CORS origins |

## License

MIT
