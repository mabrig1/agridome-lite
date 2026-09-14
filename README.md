# AgriDome Lite

**Offline farm intelligence for Nigerian and African smallholder greenhouse and intensive vegetable farmers.**

AgriDome Lite is a Progressive Web App (PWA) built with Next.js, Tailwind and FastAPI. It combines local-first farm records, explainable rule-based intelligence and optional AI assistance so a farmer can move from **observation → risk → action → evidence** even when connectivity is unreliable.

## Features

| Feature | Description |
|---|---|
| **Farm Command Center** | Farm readiness score, data-quality score, stale-reading detection, priority actions and quick access to all farm tools |
| **Climate Tracker** | Manual temperature, humidity, CO₂ and light logs with history charts and corrective guidance |
| **Climate-fit Crop Ranking** | Ranks supported crops against the latest temperature and humidity reading with transparent limitations |
| **Crop Guide** | 10 priority crops with growth stages, tasks, watering guidance and common pest references |
| **Crop Health Scanner** | Photo-based AI field triage with observation, likely causes, severity, next actions and escalation guidance |
| **Yield Predictor** | Area/plant-count based yield and revenue planning |
| **AI Advisor** | Nigerian farming context with English, Igbo, Hausa and Yoruba support |
| **Farm Profile** | Location and growing-area setup ready for future weather, market and extension integrations |
| **Offline Mode** | Core farm records remain on-device and usable without internet |
| **Pilot Evidence** | Consent, pseudonymous baseline, weekly outcomes, progress metrics, de-identified JSON/CSV export and local coordinator analysis |
| **CI Verification** | GitHub Actions validates the Next.js build and FastAPI backend on feature branches and pull requests |

## Why AgriDome is different

AgriDome is designed as a **farm operating layer**, not just a chatbot. The Command Center combines the records already captured by the app and turns them into a short list of explainable actions. AI is treated as decision support rather than a laboratory diagnosis, while the pilot module makes field outcomes exportable for extension programmes, NGOs and grant-funded trials.

See the [competitive product roadmap](docs/PRODUCT_ROADMAP.md).

## Farmer Pilot

AgriDome includes an offline evidence module for a small, supervised farmer pilot. It records consent, a one-time baseline and weekly harvest, income, cost, pest-loss and usage outcomes. Data remains on the participant's device until they choose to export a de-identified pilot file, and participants can withdraw and delete all pilot records.

- [Pilot protocol](docs/PILOT_PROTOCOL.md)
- [Grant concept note](docs/GRANT_CONCEPT_NOTE.md)
- [Field coordinator guide](docs/FIELD_COORDINATOR_GUIDE.md)
- **Coordinator workspace:** `/pilot-coordinator` imports multiple participant files locally, calculates feasibility indicators and exports a combined CSV.

The pilot materials are an operational starting point, not an ethics approval or proof of impact. A qualified research institution and agriculture extension partner should review the study before recruitment.

## Tech Stack

- **Frontend:** Next.js 14 App Router, React 18, Tailwind CSS, shadcn/ui, Recharts
- **Backend:** FastAPI, Anthropic API
- **PWA:** next-pwa, Web App Manifest
- **Persistence:** local-first browser storage for farm records and pilot evidence
- **CI:** GitHub Actions
- **Design:** dark forest green + gold

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

The backend health endpoint works even when the AI key is not configured, which makes deployment checks and observability easier.

## Deployment

### Frontend → Vercel

1. Push to GitHub.
2. Import the repository into Vercel.
3. Set `NEXT_PUBLIC_API_URL=https://your-api-host.example`.
4. Deploy.

### Backend → Render or another Python host

1. Use `backend` as the service root.
2. Build command: `pip install -r requirements.txt`.
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
4. Set `ANTHROPIC_API_KEY`.
5. Set `ALLOWED_ORIGINS` to the production frontend origin.

The included `backend/render.yaml` can be used as a Render Blueprint starting point.

## Language Support

The AI advisor supports:
- **English**
- **Igbo**
- **Hausa**
- **Yoruba**

## Crops Covered

Tomato, bell pepper, cucumber, lettuce, spinach, okra, beetroot, Irish potato, strawberry and green beans.

Crop-fit ranking is based only on the app's stored temperature and humidity targets. It does **not** replace soil, water, variety, disease-history or market assessment.

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Frontend | URL of the FastAPI backend |
| `ANTHROPIC_API_KEY` | Backend | Anthropic API key |
| `ANTHROPIC_MODEL` | Backend | Optional model override |
| `ALLOWED_ORIGINS` | Backend | Comma-separated permitted frontend origins |
| `MAX_IMAGE_BYTES` | Backend | Optional crop-health image upload ceiling; default 6 MB |

## Project Structure

```
agridome-lite/
├── .github/workflows/   # CI build verification
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/      # Farm features and Command Center
│   └── lib/             # Storage, crop data and farm intelligence
├── public/              # PWA manifest and icons
├── backend/             # FastAPI AI service
├── docs/                # Pilot, field and product documentation
└── vercel.json
```

## License

MIT
