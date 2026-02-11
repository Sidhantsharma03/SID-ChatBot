const chatWindow = document.getElementById('chatWindow');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const messageTemplate = document.getElementById('messageTemplate');

const faqPatterns = [
  {
    test: /(hi|hello|hey)/i,
    reply:
      'Hey! I\'m SID ChatBot 👋\nAsk me questions, request ideas, summarize text, or get quick coding help.',
  },
  {
    test: /(who are you|what are you)/i,
    reply:
      'I am SID ChatBot, a free browser-based assistant inspired by ChatGPT. I run entirely on simple frontend logic.',
  },
  {
    test: /(help|what can you do)/i,
    reply:
      'I can help with:\n• Brainstorming\n• Writing drafts\n• Basic coding tips\n• Short summaries\n\nTry prompts like “Give me startup ideas” or “Explain JavaScript promises simply.”',
  },
  {
    test: /(thank|thanks)/i,
    reply: 'You are welcome! 😊 Need anything else?',
  },
  {
    test: /(bye|goodbye|see you)/i,
    reply: 'Goodbye! Come back any time to chat with SID ChatBot.',
  },
];

function addMessage(role, text) {
  const node = messageTemplate.content.firstElementChild.cloneNode(true);
  node.classList.add(role);
  node.querySelector('.message-role').textContent = role === 'user' ? 'You' : 'SID ChatBot';
  node.querySelector('.message-text').textContent = text;
  chatWindow.appendChild(node);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function buildSmartResponse(input) {
  const trimmed = input.trim();

  for (const item of faqPatterns) {
    if (item.test.test(trimmed)) {
      return item.reply;
    }
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const tips = [
    'Break your request into a goal, context, and constraints for better answers.',
    'You can ask for multiple formats: bullets, table, or step-by-step.',
    'If this is for coding, include language + expected input/output.',
  ];

  return `Here is a helpful response from SID ChatBot:\n\nYou said: “${trimmed}”\n\nQuick take:\n- Your message has ${wordCount} word${wordCount === 1 ? '' : 's'}.\n- I can expand this into a detailed plan, summary, or draft.\n- ${tips[Math.floor(Math.random() * tips.length)]}`;
}

function simulateTypingAndReply(userText) {
  addMessage('bot', 'SID is typing...');
  const typingBubble = chatWindow.lastElementChild;

  window.setTimeout(() => {
    const response = buildSmartResponse(userText);
    typingBubble.querySelector('.message-text').textContent = response;
  }, 450);
}

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) {
    return;
  }

  addMessage('user', text);
  messageInput.value = '';
  simulateTypingAndReply(text);
});

addMessage(
  'bot',
  'Welcome to SID ChatBot! ✨\nI am your free ChatGPT-style assistant. Start by typing a question below.'
);
