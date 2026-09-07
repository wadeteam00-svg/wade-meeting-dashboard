# wade-meeting-dashboard

WADE design meeting database and dashboard.

## Current pages

- `/` — Meeting dashboard viewer
- `/meetings.json` — Structured meeting card data
- `/add-meeting.html` — Meeting input, preview, selection and direct publishing

## Direct publishing flow

1. Paste meeting notes.
2. Generate preview cards.
3. Untick any cards that should not be added.
4. Enter the publishing access code once per browser session.
5. Click **Publish selected cards / 發布選取內容**.
6. The server-side Vercel function safely appends approved cards to the repository's `meetings.json` on `main`.
7. The dashboard reloads from the live API, so the new cards appear without manually downloading or replacing files.

The export buttons remain as a backup download option.

## One-time deployment setup

Set these two Vercel project environment variables:

- `GITHUB_TOKEN`: a GitHub fine-grained token with Contents read/write access to `wadeteam00-svg/wade-meeting-dashboard`
- `PUBLISH_KEY`: a separate strong access code used by the Add Meeting page

Keep both values server-side. Do not put either value in frontend code or commit them to GitHub.

After this one-time setup, normal meeting publishing is preview → select → publish.
