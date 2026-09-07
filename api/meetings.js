const REPO = 'wadeteam00-svg/wade-meeting-dashboard';
const BRANCH = 'main';

function headers() {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: 'Bearer ' + token } : {})
  };
}

async function readMeetings() {
  const response = await fetch(
    'https://api.github.com/repos/' + REPO + '/contents/meetings.json?ref=' + BRANCH,
    { headers: headers(), cache: 'no-store' }
  );
  if (!response.ok) throw new Error('GitHub read failed: ' + response.status);
  const payload = await response.json();
  const encoded = String(payload.content || '').replace(/\s/g, '');
  const meetings = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
  if (!Array.isArray(meetings)) throw new Error('meetings.json must contain an array');
  return meetings;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const meetings = await readMeetings();
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json(meetings);
  } catch (error) {
    return res.status(502).json({
      error: 'Unable to load the latest meeting data.',
      detail: error.message
    });
  }
};