const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  const indexPath = path.join(process.cwd(), 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const css = `
    <style id="v16-add-meeting-entry-style">
      .v16-add-meeting-entry {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 34px;
        margin-top: 12px;
        padding: 8px 12px;
        border: 1px solid #101010;
        background: #101010;
        color: #fff !important;
        text-decoration: none;
        font-size: 11px;
        font-weight: 950;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        box-shadow: 0 10px 24px rgba(15, 15, 15, 0.08);
      }
      .v16-add-meeting-entry:hover {
        background: #ff4a12;
        border-color: #ff4a12;
        color: #fff !important;
      }
    </style>`;

  const entry = `
            <div class="v16-add-meeting-entry-wrap">
              <a class="v16-add-meeting-entry" href="/add-meeting.html">+ Add Meeting / 新增會議</a>
            </div>`;

  if (!html.includes('v16-add-meeting-entry-style')) {
    html = html.replace('</head>', `${css}\n</head>`);
  }

  if (!html.includes('v16-add-meeting-entry-wrap')) {
    html = html.replace(
      /(<p class="subtitle">[\s\S]*?<\/p>)/,
      `$1\n${entry}`
    );
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.status(200).send(html);
};
