# AgriDome Lite Field Coordinator Guide

## Purpose

This guide supports the 30-farmer feasibility pilot described in `PILOT_PROTOCOL.md`. It does not replace institutional ethics approval, data-protection review or agronomic supervision.

## Before recruitment

1. Confirm the principal investigator, extension lead, field coordinator and data manager.
2. Obtain all required institutional and community approvals.
3. Translate and field-test the participant information and consent explanation.
4. Create an incident and complaint pathway that participants can use without contacting the product developer.
5. Test the app on the actual phone and network conditions farmers will use.
6. Agree how frequently de-identified pilot files will be collected and where they will be stored.

## Enrollment visit

1. Explain the pilot in the participant's preferred language.
2. Make clear that participation is voluntary and ordinary services will not be withheld for refusing.
3. Allow questions before consent.
4. Open the **Pilot** tab and let the participant personally select the consent checkbox where possible.
5. Enter the community/state. Name and phone are optional.
6. Record the participant code in the authorized contact log only when follow-up requires it.
7. Complete the baseline before routine use of AgriDome advice.
8. Practice one climate record and explain when an extension officer must be contacted.

## Weekly follow-up

Ask the participant to enter one outcome for the same crop and cultivated area each week:

- Harvest weight in kilograms.
- Sales income in naira.
- Farm costs in naira.
- Estimated pest or disease loss percentage.
- Number of days AgriDome was used.
- A short note on major weather, pest, crop or market events.

Do not fill unknown values with invented estimates. If a value is genuinely zero, enter zero. Use the notes field to explain crop failure, no harvest, replanting or a material change in cultivated area.

## Collecting pilot files

1. Ask the participant to open the Pilot tab.
2. Select **Pilot file** to download the de-identified JSON export.
3. Confirm that the filename contains only the participant code.
4. Transfer the file through the institutionally approved method.
5. Open `/pilot-coordinator` on an authorized device.
6. Import one or more JSON files. The page processes them locally and does not upload them.
7. Re-importing a participant replaces the previously loaded copy.
8. Export the combined CSV and store it in the approved research location.
9. Select **Clear** before leaving the shared device.

Names and phone numbers are deliberately excluded from pilot exports. Never rename a pilot file with a participant's real name.

## Data-quality checks

Review weekly:

- Every participant has one baseline.
- No duplicate participant codes exist.
- Week dates are plausible and in sequence.
- Harvest, income and cost units are consistent.
- Pest loss stays within 0–100%.
- App-use days stay within 0–7.
- Extreme values are verified with the participant and documented, not silently deleted.

## Safety escalation

Escalate immediately when:

- AI advice recommends an unapproved, prohibited or clearly unsafe chemical use.
- A participant reports substantial crop damage after following advice.
- A serious plant disease may threaten neighboring farms.
- Personal data is lost, exposed or sent to an unauthorized person.
- The participant wants to withdraw or make a complaint.

Pause the affected recommendation and record the incident. The extension lead decides the agronomic response; the principal investigator decides whether research activity should pause.

## Close-out

At week 12, confirm whether the participant completed the final record, collect a final de-identified pilot file, conduct the approved close-out interview, explain how results will be shared and offer the participant the option to delete their on-device pilot data.

