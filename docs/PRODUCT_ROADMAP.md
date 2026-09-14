# AgriDome Lite — Competitive Product Roadmap

AgriDome Lite is being positioned as an **offline-first farm intelligence and evidence platform for African smallholder greenhouse and intensive vegetable farming**.

The product should not compete by having the most screens. It should compete by turning simple farmer observations into clear actions, preserving data offline, and creating evidence that extension programmes, NGOs, agribusinesses and funders can trust.

## Product principles

1. **Action before information** — every signal should end in a clear next step.
2. **Offline first** — core records, guidance and evidence must remain useful without reliable internet.
3. **Explainable intelligence** — show why an alert or recommendation was produced.
4. **Farmer-owned data** — local storage by default, portable exports, explicit sharing.
5. **Human escalation** — severe crop-health decisions should support extension professionals rather than pretend AI is a laboratory.
6. **Low-cost hardware path** — manual readings first; optional sensors later.
7. **Evidence by design** — operational metrics should be exportable for pilots, grants and programme evaluation.

## Implemented foundation

- Offline PWA
- Climate logging and corrective advice
- Crop guides and growth-stage tasks
- AI crop-health photo triage
- AI farm advisor with Nigerian context and local-language support
- Yield and revenue planning
- Farmer pilot evidence capture and coordinator analysis
- Farm Command Center
  - operational farm score
  - data-readiness score
  - stale-reading detection
  - climate and crop-health risk triage
  - priority action queue
  - climate-based crop-fit ranking
  - farm profile setup
- CI build verification for frontend and backend
- Safer AI guidance that distinguishes observation, likely causes and escalation

## Phase 2 — Field intelligence

### Weather and early warning
- Optional GPS farm location with explicit permission
- 7-day weather forecast from a low-cost/open provider
- Heat, heavy-rain, high-humidity and irrigation warnings
- Cache the latest forecast for offline viewing
- Combine forecast + crop stage + greenhouse readings into an explainable risk alert

### Crop-health intelligence
- Structured diagnosis schema: symptoms, likely causes, severity, confidence/uncertainty, actions
- Follow-up scan workflow to compare whether symptoms improved
- Offline pest and disease reference library for priority crops
- IPM action checklist and escalation workflow
- Regional outbreak signal only when verified data sources are available

### Farm operations
- Daily and weekly task board generated from crop stage and climate
- Inputs, labour and harvest log
- Expense and margin tracking per crop cycle
- Actual vs expected yield variance
- Farm-event timeline for auditability

## Phase 3 — Extension and programme platform

### Extension officer workspace
- Farmer/cohort dashboard with permission-based sharing
- Case escalation from farmer to extension officer
- Review notes and recommended follow-up
- De-identified cohort trends
- Data-quality and missing-record flags

### Multi-farm organisations
- Farm and greenhouse entities
- Roles: farmer, field officer, coordinator, programme manager
- Separate tenant data and permissions
- Bulk farmer onboarding/import
- Cohort comparison by location, crop and season

### Evidence and grants
- Pre/post baseline templates
- Outcome indicators configurable per programme
- Retention, usage and record-completeness metrics
- Exportable CSV/JSON evidence packs
- Automatically generated pilot summary with transparent limitations
- No causal-impact claims without an appropriate study design

## Phase 4 — Market and traceability

- Harvest lot records
- Buyer/order records
- Produce grading workflow
- QR traceability for selected value chains
- Market-price feeds only from verifiable sources
- Price alerts by crop/location
- Gross margin and break-even calculator

## Phase 5 — Sensors and interoperability

- Bluetooth/LoRa/Wi-Fi sensor adapter layer
- Temperature, humidity, soil moisture, EC and pH integrations
- Sensor-health monitoring and calibration reminders
- Import/export schema compatible with common farm-data standards where practical
- Public API/webhooks for approved integrations
- farmOS interoperability research for records that map cleanly to its model

## Success metrics

A feature should improve at least one of these:

- time from observation to action
- farm-record completeness
- avoidable crop loss
- yield or gross margin tracking accuracy
- farmer retention/weekly usage
- extension response time
- pilot evidence quality
- offline usability
- cost per actively supported farmer

## Positioning

**AgriDome Lite: the offline farm command center for smallholder greenhouse and intensive vegetable farmers — from climate and crop-health signals to daily action and programme evidence.**
