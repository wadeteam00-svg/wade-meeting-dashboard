const REPO = 'wadeteam00-svg/wade-meeting-dashboard';
const BRANCH = 'main';
const MAX_CARDS = 12;
const MAX_PAYLOAD_BYTES = 180000;

function headers() {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: 'Bearer ' + token } : {})
  };
}

async function readCurrent() {
  const response = await fetch(
    'https://api.github.com/repos/' + REPO + '/contents/meetings.json?ref=' + BRANCH,
    { headers: headers(), cache: 'no-store' }
  );
  if (!response.ok) throw new Error('GitHub read failed: ' + response.status);
  const payload = await response.json();
  const encoded = String(payload.content || '').replace(/\s/g, '');
  const meetings = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
  if (!Array.isArray(meetings)) throw new Error('meetings.json must contain an array');
  return { meetings, sha: payload.sha };
}

function getCards(req) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  if (!Array.isArray(body.cards)) throw new Error('cards must be an array');
  if (body.cards.length < 1 || body.cards.length > MAX_CARDS) {
    throw new Error('Please publish between 1 and ' + MAX_CARDS + ' cards.');
  }
  if (Buffer.byteLength(JSON.stringify(body.cards), 'utf8') > MAX_PAYLOAD_BYTES) {
    throw new Error('The selected cards are too large to publish in one request.');
  }

  return body.cards.map((card) => {
    if (!card || typeof card !== 'object') throw new Error('Each card must be an object.');
    const id = String(card.recordId || card.id || '').trim();
    if (!id) throw new Error('Each card needs a recordId.');
    return {
      ...card,
      id,
      recordId: id,
      source: String(card.source || 'V17 published from Add Meeting')
    };
  });
}

async function writeMeetings(meetings, sha) {
  const content = Buffer.from(JSON.stringify(meetings, null, 2) + '\n', 'utf8').toString('base64');
  const response = await fetch(
    'https://api.github.com/repos/' + REPO + '/contents/meetings.json',
    {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({
        message: 'Publish meetings from dashboard',
        content,
        sha,
        branch: BRANCH
      })
    }
  );
  if (!response.ok) {
    const detail = await response.text();
    const error = new Error('GitHub write failed: ' + response.status + ' ' + detail.slice(0, 200));
    error.conflict = response.status === 409 || response.status === 422;
    throw error;
  }
  return response.json();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.GITHUB_TOKEN || !process.env.PUBLISH_KEY) {
    return res.status(503).json({
      error: 'Publishing is not configured yet. Add the server-side publishing settings in Vercel.'
    });
  }
  const suppliedKey = String(req.headers['x-publish-key'] || '');
  if (!suppliedKey || suppliedKey !== process.env.PUBLISH_KEY) {
    return res.status(401).json({ error: 'Invalid publishing access code.' });
  }

  let cards;
  try {
    cards = getCards(req);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const current = await readCurrent();
      const existingIds = new Set(
        current.meetings.map((item) => String(item.recordId || item.id || '')).filter(Boolean)
      );
      const newCards = cards.filter((card) => !existingIds.has(card.recordId));

      if (!newCards.length) {
        return res.status(200).json({
          added: 0,
          skipped: cards.length,
          message: 'These cards are already in the dashboard.'
        });
      }

      try {
        await writeMeetings(current.meetings.concat(newCards), current.sha);
        return res.status(200).json({
          added: newCards.length,
          skipped: cards.length - newCards.length,
          message: 'Published to the dashboard.'
        });
      } catch (error) {
        if (!error.conflict || attempt === 1) throw error;
      }
    }
  } catch (error) {
    return res.status(502).json({
      error: 'Could not publish the cards to the dashboard.',
      detail: error.message
    });
  }
};