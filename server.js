const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 4173);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
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

function mapHistory(history = []) {
  return history
    .filter((item) => item && typeof item.text === 'string' && item.text.trim())
    .slice(-12)
    .map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.text.trim() }],
    }));
}

function extractModelText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return null;
  }

  return parts
    .filter((part) => typeof part.text === 'string')
    .map((part) => part.text)
    .join('\n')
    .trim();
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

    if (!GEMINI_API_KEY) {
      return sendJson(res, 500, {
        error:
          'Missing GEMINI_API_KEY on server. Set it before starting server to get real AI answers.',
      });
    }

    const systemPrompt =
      'You are SID ChatBot, a helpful and accurate assistant like ChatGPT/Gemini. Answer user queries directly. If user writes Hinglish/Hindi, reply naturally in Hinglish. Keep answers practical, clear, and truthful.';

    const contents = mapHistory(history);
    contents.push({ role: 'user', parts: [{ text: message }] });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
        tools: [{ google_search: {} }],
      }),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return sendJson(res, apiResponse.status, {
        error: data?.error?.message || 'Gemini API request failed.',
      });
    }

    const text = extractModelText(data);
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
    const contentType = mimeTypes[extension] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
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
});
