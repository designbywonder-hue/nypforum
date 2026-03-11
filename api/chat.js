'use strict';
const https = require('https');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' }); return; }

  let rawBody = '';
  req.on('data', (chunk) => { rawBody += chunk.toString(); });
  req.on('end', () => {
    let body;
    try {
      body = (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0)
        ? req.body : JSON.parse(rawBody);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON', details: e.message });
      return;
    }

    const payload = JSON.stringify(body);
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => { data += chunk; });
      apiRes.on('end', () => {
        try {
          res.status(apiRes.statusCode).json(JSON.parse(data));
        } catch (e) {
          res.status(500).json({ error: 'Bad Anthropic response', raw: data.slice(0, 300) });
        }
      });
    });

    apiReq.on('error', (e) => {
      res.status(500).json({ error: 'Network error', details: e.message });
    });

    apiReq.write(payload);
    apiReq.end();
  });
};
