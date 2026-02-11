const http = require('http');
const fs = require('fs');
const path = require('path');

function readEnvFileValue(keyName) {
  try {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      return '';
    }

    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const splitIndex = trimmed.indexOf('=');
      if (splitIndex < 0) {
        continue;
      }

      const key = trimmed.slice(0, splitIndex).trim();
      if (key !== keyName) {
        continue;
      }

      return trimmed.slice(splitIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  } catch (_error) {
    return '';
  }

  return '';
}

const PORT = Number(process.env.PORT || 4173);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || readEnvFileValue('OPENAI_API_KEY');
const OPENAI_MODEL = process.env.OPENAI_MODEL || readEnvFileValue('OPENAI_MODEL') || 'gpt-4o-mini';
const ROOT = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body too large.'));
      }
    });

    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function buildMissingKeyMessage() {
  return [
    'Missing OPENAI_API_KEY on server.',
    'Set the key and restart server.',
    'PowerShell: $env:OPENAI_API_KEY="your_openai_key"',
    'OR create .env with OPENAI_API_KEY=your_openai_key',
  ].join(' ');
}

function mapHistoryToMessages(history = [], userMessage) {
  const systemPrompt =
    'You are SID ChatBot, a helpful ChatGPT-style assistant. Answer clearly and directly. If user writes in Hinglish/Hindi, reply naturally in Hinglish with practical steps.';

  const historyMessages = history
    .filter((item) => item && typeof item.text === 'string' && item.text.trim())
    .slice(-12)
    .map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: item.text.trim(),
    }));

  return [
    { role: 'system', content: systemPrompt },
    ...historyMessages,
    { role: 'user', content: userMessage },
  ];
}

function extractAssistantText(data) {
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .join('\n')
      .trim();
  }

  return '';
}

async function handleChat(req, res) {
  try {
    const rawBody = await readRequestBody(req);
    const parsed = JSON.parse(rawBody || '{}');
    const message = typeof parsed.message === 'string' ? parsed.message.trim() : '';
    const history = Array.isArray(parsed.history) ? parsed.history : [];

    if (!message) {
      return sendJson(res, 400, { error: 'Message is required.' });
    }

    if (!OPENAI_API_KEY) {
      return sendJson(res, 500, { error: buildMissingKeyMessage() });
    }

    const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: mapHistoryToMessages(history, message),
        temperature: 0.7,
      }),
    });

    const rawApiText = await apiResponse.text();
    let data = {};

    try {
      data = rawApiText ? JSON.parse(rawApiText) : {};
    } catch (_error) {
      return sendJson(res, 502, {
        error: `OpenAI API returned non-JSON response. Status: ${apiResponse.status}.`,
      });
    }

    if (!apiResponse.ok) {
      const messageFromApi =
        data?.error?.message || data?.message || 'OpenAI request failed. Check API key/model/quota.';
      return sendJson(res, apiResponse.status, { error: messageFromApi });
    }

    const text = extractAssistantText(data);
    if (!text) {
      return sendJson(res, 502, { error: 'No response text received from model.' });
    }

    return sendJson(res, 200, { reply: text });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return sendJson(res, 400, { error: 'Invalid JSON payload.' });
    }

    return sendJson(res, 500, { error: `Server error: ${error.message}` });
  }
}

function serveStatic(req, res) {
  const requestPath = req.url === '/' ? '/index.html' : req.url;
  const safePath = path.normalize(requestPath).replace(/^\/+/g, '');
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }

    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[extension] || 'application/octet-stream' });
    return res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/chat') {
    return handleChat(req, res);
  }

  if (req.method === 'GET') {
    return serveStatic(req, res);
  }

  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Method Not Allowed');
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`SID ChatBot running at http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Model: ${OPENAI_MODEL}`);
  if (!OPENAI_API_KEY) {
    // eslint-disable-next-line no-console
    console.log('⚠️  OPENAI_API_KEY not found. Chat endpoint will return setup guidance.');
  }
});
