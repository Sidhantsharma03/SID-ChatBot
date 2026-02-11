const chatWindow = document.getElementById('chatWindow');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const messageTemplate = document.getElementById('messageTemplate');

const chatState = {
  userName: null,
  turns: 0,
};

function addMessage(role, text) {
  const node = messageTemplate.content.firstElementChild.cloneNode(true);
  node.classList.add(role);
  node.querySelector('.message-role').textContent = role === 'user' ? 'You' : 'SID ChatBot';
  node.querySelector('.message-text').textContent = text;
  chatWindow.appendChild(node);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function extractName(message) {
  const namePatterns = [
    /(?:i am|i'm|my name is)\s+([a-zA-Z][a-zA-Z\s'-]{1,30})/i,
    /(?:main|mai)\s+([a-zA-Z][a-zA-Z\s'-]{1,30})\s+(?:hu|hoon)/i,
    /(?:mera naam|myself)\s+([a-zA-Z][a-zA-Z\s'-]{1,30})/i,
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim().replace(/\s+/g, ' ');
    }
  }

  return null;
}

function summarizeRequest(text) {
  const cleaned = text.trim();
  const shortText = cleaned.length > 120 ? `${cleaned.slice(0, 117)}...` : cleaned;

  return `Aapne pucha: “${shortText}”`;
}

function getTaskTemplate(text) {
  const t = text.toLowerCase();

  if (/(code|javascript|python|bug|fix|program|api|html|css)/i.test(t)) {
    return 'Coding help mode ON ✅\n\nStep 1: Problem ko clear define karo.\nStep 2: Input/output examples do.\nStep 3: Main aapko clean solution + explanation de dunga.';
  }

  if (/(idea|startup|business|project)/i.test(t)) {
    return 'Idea mode ON 🚀\n\n1) Niche choose karo\n2) Problem identify karo\n3) Solution build karo\n4) MVP test karo\n\nAgar chaho to main 5 ready-made ideas bhi de sakta hu.';
  }

  if (/(resume|cv|interview|job)/i.test(t)) {
    return 'Career mode ON 💼\n\nMain aapka resume improve, interview Q&A prepare, aur role-specific answers bana sakta hu.';
  }

  if (/(summarize|summary|explain|samjha)/i.test(t)) {
    return 'Explanation mode ON 📘\n\nMain difficult topic ko simple language me step-by-step samjha dunga.';
  }

  return 'Main is topic par aapko structured answer de sakta hu. Agar chaho to main isko:\n• short answer\n• detailed answer\n• step-by-step plan\nme convert kar du.';
}

function buildSmartResponse(input) {
  const trimmed = input.trim();
  if (!trimmed) {
    return 'Kuch bhi pucho — main help karne ke liye ready hu.';
  }

  chatState.turns += 1;

  const maybeName = extractName(trimmed);
  if (maybeName) {
    chatState.userName = maybeName;
    return `Hi ${maybeName}! 👋\nNice to meet you. Main SID ChatBot hu.\nAap jo bhi puchoge, main best possible answer dene ki koshish karunga.`;
  }

  if (/(hi|hello|hey|hii)/i.test(trimmed)) {
    const namePart = chatState.userName ? ` ${chatState.userName}` : '';
    return `Hi${namePart}! Main SID ChatBot hu. 😊\nAap apna question bhejo — main directly uska answer dunga.`;
  }

  if (/(who are you|what are you|tum kaun ho|ap kaun ho)/i.test(trimmed)) {
    return 'Main SID ChatBot hu — ek free ChatGPT-style assistant. Aap coding, ideas, writing, ya normal questions sab puch sakte ho.';
  }

  if (/(thanks|thank you|shukriya|dhanyawad)/i.test(trimmed)) {
    return 'Most welcome! 🙌 Agar next question ho to seedha bhej do.';
  }

  if (/(bye|goodbye|see you|milte)/i.test(trimmed)) {
    return 'Bye! 👋 Jab bhi zarurat ho, SID ChatBot available hai.';
  }

  const nameLead = chatState.userName ? `${chatState.userName}, ` : '';

  return `${nameLead}${summarizeRequest(trimmed)}\n\n${getTaskTemplate(trimmed)}\n\nAgar aap chaho to main abhi isi query ka detailed final answer bhi generate kar deta hu — bas bolo: “detailed answer do”.`;
}

function simulateTypingAndReply(userText) {
  addMessage('bot', 'SID is typing...');
  const typingBubble = chatWindow.lastElementChild;

  window.setTimeout(() => {
    const response = buildSmartResponse(userText);
    typingBubble.querySelector('.message-text').textContent = response;
  }, 400);
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
  'Welcome to SID ChatBot! ✨\nAap jo bhi puchoge uska answer dunga. Example: “Hi I am Sidhant” ya “Mujhe startup idea do”.'
);
