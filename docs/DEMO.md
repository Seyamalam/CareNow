# Innovation Exhibitor walkthrough

Use the standalone Android build or https://carenow-demo.pages.dev. Allow internet access. All displayed people, credentials, availability, prices and records are exhibition fixtures.

## Five-minute booth flow

1. Launch to the animated CareNow mark. Show the family overview and switch between Ayesha, Nasima and Arham.
2. Open Doctors. Search a specialty, inspect a profile, select patient/date/time and confirm a booking. Open the appointment.
3. Send a note. Attach `fixtures/demo-report.pdf` through the file picker and open the saved attachment. Start the labeled demo call, toggle microphone/camera controls, then end it to create a consultation record.
4. Open Elderly care, select a service, change 8/12/24-hour shift and 7/15/30-day duration, and show the recalculated BDT total. Complete the request and use the simulation control to advance its tracking timeline.
5. Open Motherhood. Edit the expected due date, save a journal entry, and check a daily item. Show Postpartum and the linked nutrition/learning guides.
6. Switch to Arham in Child development. Complete a routine activity, then open a therapy service.
7. Show Emergency support, Activity, Health records and Notifications. Toggle Bangla navigation in Profile.
8. Relaunch the app to demonstrate D1 persistence. Profile → Start a fresh demo restores the initial fictional fixtures for the next visitor.

## Useful demo inputs

- Patient: Ayesha Rahman; age 29; female.
- Contact: Ayesha Rahman; `01700000000` (fictional test number).
- Address: House 12, Road 7, Dhanmondi; city Dhaka.
- Email may be left empty.
- PDF fixture: `fixtures/demo-report.pdf`, under 2 KB.

## Boundaries to explain

D1 persistence, requests, profiles, messages, uploads and tracking controls are functional. Calls and dispatch are explicitly simulated; no live clinician, camera, microphone, real ambulance or payment processor is connected. This is a care-coordination exhibition demo, not a service accepting real patients. Sessions expire after seven days; reset deletes the current session and its attachments. Bangla covers navigation and selected primary labels, while the full service catalog is English.
