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

async function getAiReply(message) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history: chatState.history,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Unable to get response from server.');
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
  'Welcome to SID ChatBot! ✨\nAb main backend AI se real answers dunga. Kuch bhi pucho.'
);
