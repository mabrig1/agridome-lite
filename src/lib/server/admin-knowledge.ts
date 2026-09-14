import 'server-only'

export interface KnowledgeArticle {
  id: string
  category: string
  title: string
  summary: string
  steps: string[]
  note: string
}

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: 'first-session', category: 'Getting started', title: 'Run your first AgriDome session',
    summary: 'A practical onboarding sequence for administrators supporting a farmer.',
    steps: [
      'Open the farm dashboard on the device the farmer will normally use. Connect to the internet for the first visit so the public app can load.',
      'In Farm profile, enter the farm location and greenhouse or growing area in square metres, then select Save farm profile.',
      'Use Log climate to enter a real temperature and humidity reading. Open Crop plan and choose the crop being grown.',
      'For a new structure, complete Zero-cash build and Soil Treatment before planting. Save both assessments for pilot evidence.',
      'If the farmer is participating in an approved pilot, obtain consent, enroll the participant, and save the baseline before collecting weekly outcomes.',
      'Demonstrate how to reopen the public app offline and how to export pilot records. Keep this administrator guide in an authenticated online session.',
    ],
    note: 'Farm records belong to the current browser/device. Administrator sign-in does not create a central database or automatically synchronise participants’ records.',
  },
  {
    id: 'command-center', category: 'Daily operations', title: 'Read the Farm Command Center',
    summary: 'Understand readiness, data freshness, priority actions and crop-fit suggestions.',
    steps: [
      'Start with the Farm readiness score, Data readiness and Climate freshness indicators.',
      'Read Today’s priority actions. Open the relevant climate, crop, pest, yield or pilot tool from the action shown.',
      'Replace stale readings with current measurements. Add missing records before interpreting the score.',
      'Review crop-fit suggestions alongside local soil, water, variety and market information.',
      'Return to the dashboard after saving records to refresh the summary from this device.',
    ],
    note: 'The score is an operational triage aid. It does not certify crop health, guarantee yield or demonstrate research impact. The saved location does not currently supply live weather forecasts.',
  },
  {
    id: 'zero-cash', category: 'Greenhouse and soil', title: 'Use the Zero-Cash Build Assistant',
    summary: 'Audit recovered materials, reject unsafe inputs and prepare a construction sequence.',
    steps: [
      'Open Zero-cash build from the dashboard, then choose Zero-Cash Build in the Thesis Field Toolkit.',
      'Enter the target growing area and maximum new-material cash budget. Use ₦0 only when no new materials will be purchased.',
      'Check the inventory for frame material, crop cover, fasteners, bed/wall material and a watering system. Tick a category only after confirming it is available and usable.',
      'Inspect recovered materials. Mark I found a suspect/unsafe material if any listed hazard is present; stop and replace unsafe material.',
      'Read the missing-material list and feasibility result. Source safe materials from owned stock, donations, exchanges or recovered supplies.',
      'Follow the displayed build sequence: site preparation, sorting and cleaning, braced frame, ventilated cover, beds and watering, then soil assessment.',
      'Select Save build assessment for pilot evidence. Keep separate records of actual spending, transport, labour and changes made during construction.',
    ],
    note: 'Zero cash refers to new-material outlay, not total economic cost. The feasibility flag is based on your checklist; it is not an engineering inspection or a complete structural design.',
  },
  {
    id: 'soil-treatment', category: 'Greenhouse and soil', title: 'Use the Soil Health and Treatment Assistant',
    summary: 'Record drainage, disease history, contamination concerns and soil-test status.',
    steps: [
      'Open the Thesis Field Toolkit and choose Soil Treatment.',
      'Answer each condition honestly: drainage, known soil-borne disease, suspected contamination, soil testing and mature organic matter.',
      'If contamination is suspected, follow EXPERT REVIEW REQUIRED and postpone planting pending qualified assessment.',
      'If drainage is poor, correct waterlogging before planting. If disease is known, follow the sanitation guidance and seek extension advice for severe or recurring cases.',
      'Treat the app’s soil-check recommendation as a prompt to obtain an appropriate test or local extension assessment before nutrient or chemical correction.',
      'Select Save soil assessment for pilot evidence. Update and save again when conditions have actually changed.',
    ],
    note: 'The app records a checklist assessment and provides conservative guidance; it does not analyse a soil sample or prescribe fertiliser, lime or pesticide doses. A green status still depends on accurate inputs.',
  },
  {
    id: 'climate', category: 'Daily operations', title: 'Log and review greenhouse climate',
    summary: 'Keep measurements current and use the history to follow changes.',
    steps: [
      'Select Log climate. Open New Reading and enter temperature in °C and relative humidity as a percentage.',
      'Add CO₂, light and notes only when you have corresponding measurements or observations.',
      'Select Save Reading, then check Current Conditions and the displayed advice.',
      'Switch between Log and Chart to inspect trends; use History to review recent readings.',
      'Record a new reading after a meaningful ventilation, watering or shading change so you can compare conditions.',
    ],
    note: 'These are manually entered observations. Do not describe them as automatic sensor readings or a live weather service.',
  },
  {
    id: 'crop-plan', category: 'Daily operations', title: 'Plan crops and track growth stages',
    summary: 'Use crop profiles, planting dates, growth tasks and watering guidance.',
    steps: [
      'Open Crop plan and select a crop. The catalogue includes the thesis focal crops onion, cabbage and lettuce.',
      'Review the crop’s preferred conditions, harvest estimate, watering information and pests to watch for.',
      'Select Start Tracking This Crop. The current app records today as the planting date; keep the actual planting date separately if it differs. Review the stage tasks as the crop develops.',
      'Advance the growth stage when field observations support it; reset tracking only when intentionally starting over.',
      'Use the watering schedule as a planning aid and compare it with actual soil moisture, drainage and weather conditions.',
    ],
    note: 'Crop profiles contain general planning values. Local varieties and growing conditions may differ; forecast harvest dates and water needs are not guarantees.',
  },
  {
    id: 'pest-scanner', category: 'AI tools', title: 'Use crop-health image analysis',
    summary: 'Capture useful images and interpret AI observations carefully.',
    steps: [
      'Connect to the internet and open Scan crop. Capture or upload a clear photo of the affected crop area.',
      'Select the crop type when known. Avoid uploading images containing people or unnecessary personal information.',
      'Submit the photo and read the analysis, separating visible observations from possible causes.',
      'Record symptoms and follow-up actions. For rapid spread, severe damage or uncertain causes, contact a qualified extension worker.',
      'If analysis fails, check the connection and try a smaller, clearer image. Administrators should verify that the configured AI backend is available.',
    ],
    note: 'Images are sent to the configured AI service for analysis. Results are advisory and do not replace laboratory diagnosis or locally authorised pesticide labels.',
  },
  {
    id: 'advisor', category: 'AI tools', title: 'Ask the agricultural advisor',
    summary: 'Get more useful answers by supplying the farm context and a focused question.',
    steps: [
      'Connect to the internet and select Ask advisor.',
      'Choose English, Igbo, Hausa or Yoruba from the language control.',
      'Describe the crop, growth stage, location, symptoms and recent climate or watering observations.',
      'Ask one clear question, read the response and request clarification where a step is unclear.',
      'Check high-impact advice with local extension expertise. Keep personal participant information out of the conversation.',
    ],
    note: 'AI responses depend on the configured backend and provider. The advisor is not guaranteed to know current market prices, pesticide approvals or local weather.',
  },
  {
    id: 'yield', category: 'Daily operations', title: 'Use yield planning responsibly',
    summary: 'Compare planning estimates with measured harvest results.',
    steps: [
      'Open Yield plan and select the crop and growing area requested by the form.',
      'Complete the available production inputs and review the predicted yield.',
      'Use the estimate to plan labour, containers and marketing while allowing for uncertainty.',
      'Record actual harvest weights and financial outcomes in the pilot’s weekly records when applicable.',
      'Explain differences between predictions and observations rather than replacing observed results with estimates.',
    ],
    note: 'A prediction is a planning estimate, not observed evidence or a promise of farm income. Revenue uses built-in price assumptions, not live market prices.',
  },
  {
    id: 'pilot-records', category: 'Pilot and evidence', title: 'Enroll a participant and collect pilot evidence',
    summary: 'Follow consent, baseline, weekly recording and assessment-saving steps.',
    steps: [
      'Open Pilot evidence. Review the consent explanation and enroll only an eligible participant who has agreed to take part.',
      'Use a participant code and record the requested enrollment details. Keep identity records separate from shared analysis files.',
      'Save the baseline crop, growing area, weekly harvest, income and pest-loss estimate before intervention.',
      'Save greenhouse-build and soil assessments in the Thesis Field Toolkit; confirm their status under Thesis evidence readiness.',
      'Add weekly outcomes with the correct week, crop, measured harvest, sales income, costs, estimated pest loss, days of app use and notes.',
      'Export the pilot JSON for the coordinator. Assessment-only JSON export is supported once enrolled, even before baseline or weekly records exist.',
    ],
    note: 'CSV rows currently represent weekly outcomes; an assessment-only participant may produce a header-only CSV. Use JSON to preserve that participant’s assessments. Record simulated data as simulated, and never present it as field observation.',
  },
  {
    id: 'coordinator', category: 'Pilot and evidence', title: 'Import participant files and interpret summaries',
    summary: 'Use the local coordinator workspace to combine de-identified pilot exports.',
    steps: [
      'Open the Pilot Coordinator workspace at /pilot-coordinator.',
      'Import authorised participant JSON exports. Review any validation errors and obtain corrected exports instead of guessing missing values.',
      'If the same participant is imported again, the newer imported file replaces the existing entry for that participant code.',
      'Review participant counts, baselines, weekly completeness, retention, harvest, finances and thesis intervention indicators.',
      'Use the combined CSV export for analysis and securely retain source JSON files. Clearing the coordinator list removes its current imported working set.',
      'Explain baseline comparisons as exploratory observations; assess missing data and study design before making impact claims.',
    ],
    note: 'The coordinator processes files in the browser and does not fetch everyone’s records automatically. Its existing route is separate from this protected administrator knowledge base.',
  },
  {
    id: 'offline-backup', category: 'Support and access', title: 'Offline use, backups and shared devices',
    summary: 'Understand which features work offline and how to reduce accidental data loss.',
    steps: [
      'Load the public app online before using its offline features. Reopen it on the same browser and device.',
      'Use local crop guides, climate records, build/soil checklists and pilot records offline after the app has loaded.',
      'Reconnect for AI image analysis, AI chat and administrator sign-in. The administrator knowledge base deliberately requires an online session.',
      'Export pilot JSON files regularly and store them securely outside the browser. These exports are not a full backup of all app data.',
      'Avoid clearing site data or uninstalling the app until necessary records have been saved. A different browser does not automatically inherit the old browser’s records.',
      'For withdrawal, use the pilot deletion control and review its confirmation. Separately handle already exported files according to the agreed retention policy.',
    ],
    note: 'Signing out of the administrator area does not erase the device’s ordinary farm records. Use an appropriate device-sharing policy where several people use one phone.',
  },
  {
    id: 'admin-access', category: 'Support and access', title: 'Administrator access and troubleshooting',
    summary: 'Sign in, search this guide, protect access and diagnose common support issues.',
    steps: [
      'From the farm dashboard, select Administrator sign in. Use the designated administrator email and the password configured by the app owner.',
      'Search this knowledge base by a task or symptom, or choose a category. Expand an article to read its steps.',
      'Sessions expire after two hours. Select Sign out when finished, especially on a shared device.',
      'For incorrect credentials, verify the email and password. After repeated attempts, wait one minute before trying again.',
      'If sign-in says it is awaiting secure setup, the deployment owner must complete the administrator setup described in the repository operations guide.',
      'For blank or stale public screens, reconnect and reload first. Export important records before considering any action that clears site data.',
    ],
    note: 'There is no public administrator registration. Entering the owner’s email alone never grants access, and there is no default password.',
  },
]
