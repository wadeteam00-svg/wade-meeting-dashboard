# Vercel Deploy Guide — WADE Meeting Dashboard V15

This folder is ready for Vercel static deployment.

## Files

- `index.html` — dashboard viewer
- `meetings.json` — structured meeting card database
- `vercel.json` — Vercel static hosting config

## Option A — Vercel website upload

1. Go to Vercel Dashboard.
2. Create a new project.
3. Upload this folder, or connect it through GitHub.
4. Framework preset: **Other**.
5. Build command: leave empty.
6. Output directory: leave empty or use `.`.
7. Deploy.

## Option B — Vercel CLI

```bash
cd wade_meeting_dashboard_v15_vercel
vercel
```

For production:

```bash
vercel --prod
```

## Important

Do not open `index.html` by double-clicking locally, because the dashboard uses `fetch()` to read `meetings.json`. Use Vercel, or run a local server:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```
