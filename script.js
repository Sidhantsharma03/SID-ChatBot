const chatWindow = document.getElementById('chatWindow');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const messageTemplate = document.getElementById('messageTemplate');

const chatState = {
  history: [],
};

function addMessage(role, text) {
  const node = messageTemplate.content.firstElementChild.cloneNode(true);
  node.classList.add(role);
  node.querySelector('.message-role').textContent = role === 'user' ? 'You' : 'SID ChatBot';
  node.querySelector('.message-text').textContent = text;
  chatWindow.appendChild(node);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return node;
}

function buildFriendlyBackendError(rawText) {
  const fallbackText =
    'Backend response JSON me nahi mila. Please app ko `node server.js` se run karo (Live Server se nahi).';

  if (!rawText || !rawText.trim()) {
    return fallbackText;
  }

  const trimmed = rawText.trim();

  if (trimmed.startsWith('<!DOCTYPE html') || trimmed.startsWith('<html')) {
    return 'Lagta hai aap app ko static server (jaise Live Server / 127.0.0.1:5500) par chala rahe ho. Ye chatbot backend API maangta hai. `node server.js` run karke `http://localhost:4173` open karo.';
  }

  return `${fallbackText}\nServer response: ${trimmed.slice(0, 180)}`;
}

function humanizeApiError(errorMessage) {
  const message = (errorMessage || '').trim();
  const lower = message.toLowerCase();

  if (!message) {
    return 'Unknown backend error. Please check server logs.';
  }

  if (lower.includes('quota') || lower.includes('rate limit') || lower.includes('exceeded your current quota')) {
    const retryMatch = message.match(/retry in\s+([\d.]+)s/i);
    const retryText = retryMatch ? `\nRetry after ~${Math.ceil(Number(retryMatch[1]))} seconds.` : '';
    return `API quota/rate-limit reached.\n\nKya karo:\n1) OpenAI dashboard me usage/quota check karo\n2) Sahi project/API key use karo\n3) 1 min baad retry karo${retryText}\n\nTip: Free-tier limit hit hone par ye normal hai.`;
  }

  if (lower.includes('missing openai_api_key')) {
    return 'Server ko OpenAI key nahi mili. PowerShell me yeh chalao:\n$env:OPENAI_API_KEY="your_openai_key"\nPhir `node server.js` restart karo.';
  }

  if (lower.includes('invalid api key') || lower.includes('incorrect api key') || lower.includes('openai_api_key')) {
    return 'Galat/invalid key detect hui. OPENAI_API_KEY me valid OpenAI key use karo.';
  }

  return message;
}

async function readApiResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  throw new Error(buildFriendlyBackendError(text));
}

async function getAiReply(message) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history: chatState.history,
    }),
  });

  const data = await readApiResponse(response);

  if (!response.ok) {
    throw new Error(humanizeApiError(data.error || 'Unable to get response from server.'));
  }

  if (!data.reply || typeof data.reply !== 'string') {
    throw new Error('Reply missing from API response. Check backend logs.');
  }

  return data.reply;
}

async function simulateTypingAndReply(userText) {
  const typingBubble = addMessage('bot', 'SID is thinking...');

  try {
    const response = await getAiReply(userText);
    typingBubble.querySelector('.message-text').textContent = response;
    chatState.history.push({ role: 'assistant', text: response });
  } catch (error) {
    typingBubble.querySelector('.message-text').textContent = `Error: ${error.message}`;
  }
}

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) {
    return;
  }

  addMessage('user', text);
  chatState.history.push({ role: 'user', text });
  messageInput.value = '';
  simulateTypingAndReply(text);
});

addMessage(
  'bot',
  'Welcome to SID ChatBot! ✨\nMain real backend AI se answer deta hu. Kuch bhi pucho.\nTip: app ko `node server.js` se hi run karo.'
);
