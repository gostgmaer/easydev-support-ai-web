(function() {
  // Extract Tenant ID from the script tag URL parameters
  const scriptTag = document.currentScript;
  const urlParams = new URLSearchParams(scriptTag.src.split('?')[1]);
  const tenantId = urlParams.get('tenantId');

  if (!tenantId) {
    console.error('EasyDev Chat Widget: tenantId is required in the script src.');
    return;
  }

  // Inject Widget CSS
  const styles = `
    #easydev-chat-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    #easydev-chat-bubble {
      width: 60px;
      height: 60px;
      background-color: #4F46E5; /* Indigo-600 */
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    #easydev-chat-bubble:hover {
      transform: scale(1.05);
    }
    #easydev-chat-bubble svg {
      fill: white;
      width: 28px;
      height: 28px;
    }
    #easydev-chat-window {
      display: none;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      position: absolute;
      bottom: 80px;
      right: 0;
      flex-direction: column;
      overflow: hidden;
    }
    #easydev-chat-header {
      background: #4F46E5;
      color: white;
      padding: 16px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #easydev-chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f9fafb;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .easydev-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
    }
    .easydev-msg-bot {
      background: white;
      border: 1px solid #e5e7eb;
      color: #111827;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .easydev-msg-user {
      background: #4F46E5;
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    #easydev-chat-input-area {
      padding: 12px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
    }
    #easydev-chat-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #d1d5db;
      border-radius: 20px;
      outline: none;
      font-size: 14px;
    }
    #easydev-chat-input:focus {
      border-color: #4F46E5;
    }
    #easydev-chat-send {
      background: none;
      border: none;
      color: #4F46E5;
      cursor: pointer;
      font-weight: 600;
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

  // Inject HTML
  const container = document.createElement('div');
  container.id = 'easydev-chat-container';
  container.innerHTML = `
    <div id="easydev-chat-window">
      <div id="easydev-chat-header">
        <span>Support Team</span>
        <button id="easydev-chat-close" style="background:none;border:none;color:white;cursor:pointer;">✕</button>
      </div>
      <div id="easydev-chat-messages">
        <div class="easydev-msg easydev-msg-bot">Hello! How can we help you today?</div>
      </div>
      <div id="easydev-chat-input-area">
        <input type="text" id="easydev-chat-input" placeholder="Type a message..." />
        <button id="easydev-chat-send">Send</button>
      </div>
    </div>
    <div id="easydev-chat-bubble">
      <svg viewBox="0 0 24 24"><path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"/></svg>
    </div>
  `;
  document.body.appendChild(container);

  // Logic
  const bubble = document.getElementById('easydev-chat-bubble');
  const chatWindow = document.getElementById('easydev-chat-window');
  const closeBtn = document.getElementById('easydev-chat-close');
  const sendBtn = document.getElementById('easydev-chat-send');
  const input = document.getElementById('easydev-chat-input');
  const messagesDiv = document.getElementById('easydev-chat-messages');

  let isOpen = false;
  // Generate a random session ID for the user
  const sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);

  bubble.addEventListener('click', () => {
    isOpen = !isOpen;
    chatWindow.style.display = isOpen ? 'flex' : 'none';
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    chatWindow.style.display = 'none';
  });

  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;

    // 1. Render User Message
    const userMsg = document.createElement('div');
    userMsg.className = 'easydev-msg easydev-msg-user';
    userMsg.innerText = text;
    messagesDiv.appendChild(userMsg);
    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // 2. Send to Backend Webhook
    try {
      // Determine backend URL based on where the script is loaded
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isLocal ? 'http://localhost:3000' : 'https://api.easydev.com';

      const response = await fetch(\`\${apiUrl}/v1/channels/website-chat/webhook\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId
        },
        body: JSON.stringify({
          sessionId: sessionId,
          text: text,
          timestamp: new Date().toISOString()
        })
      });

      // 3. Receive AI/Agent Response via Socket or Polling
      // (For this lightweight script, we simulate the async response. 
      // In prod, this would establish a Socket.IO connection for real-time replies).
      setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'easydev-msg easydev-msg-bot';
        botMsg.innerText = "Thanks for your message! Our AI is reviewing your request.";
        messagesDiv.appendChild(botMsg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }, 1000);

    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

})();
