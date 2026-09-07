# wade-meeting-dashboard

WADE design meeting database and dashboard.

## Current pages

- `/` — Meeting dashboard viewer
- `/meetings.json` — Structured meeting card data
- `/add-meeting.html` — V16 frontend input prototype for adding new meeting notes, generating preview cards, and exporting updated JSON

## V16 input prototype note

`add-meeting.html` does not directly write to GitHub or a database. It is a safe preview layer:

1. Paste meeting notes.
2. Generate preview cards.
3. Check the extracted cards manually.
4. Export preview JSON or a merged `meetings.json`.
5. Replace `meetings.json` in GitHub after confirmation.

The next planned backend stage is Google Sheet + Apps Script JSON endpoint.