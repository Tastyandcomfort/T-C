// ===================================================
// SECTION VIEW MANAGER ENGINE
// ===================================================
function switchView(viewId, element) {
  // Hide all sections smoothly
  const sections = document.querySelectorAll('.app-section');
  sections.forEach(sec => sec.classList.remove('active-view'));
  
  // Show target section
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add('active-view');
  }

  // Update active states on desktop sidebar
  const sideItems = document.querySelectorAll('.side-item');
  sideItems.forEach(item => item.classList.remove('active'));
  
  // Update active states on mobile bottom navigation tab-bar
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.classList.remove('active'));

  // Highlight active element trigger frame
  if (element) {
    element.classList.add('active');
  }
}

// ===================================================
// INITIALIZE SYSTEM EVENTS & IMMEDIATE APPLE-STYLE POPUP
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
  const closeButton = document.getElementById('apple-alert-close-btn');
  const popupOverlay = document.getElementById('apple-alert-overlay');
  
  // Check session state engine to see if it's already fired during this page instance
  const hasShownPopup = sessionStorage.getItem('menuPopupShown');
  
  // Trigger the popup immediately on fresh page load if it hasn't been shown yet
  if (!hasShownPopup && popupOverlay) {
    popupOverlay.classList.remove('hidden');
    // Mark session space so it won't repeat until a browser refresh/reload event triggers
    sessionStorage.setItem('menuPopupShown', 'true');
  }
  
  // Close dialogue actions when clicking the "OK" button
  if (closeButton && popupOverlay) {
    closeButton.addEventListener('click', () => {
      popupOverlay.classList.add('hidden');
    });
  }
});

// ===================================================
// SERVICE MONITOR OVERLAY HANDLERS
// ===================================================
function showService(title, description) {
  document.getElementById('monitor-placeholder').classList.add('hidden');
  const dataBlock = document.getElementById('monitor-data');
  dataBlock.classList.remove('hidden');
  
  document.getElementById('monitor-title').innerText = title;
  document.getElementById('monitor-desc').innerText = description;
}

// ===================================================
// BIO COMPONENT ACTIONS
// ===================================================
function toggleUpi() {
  const upiFrame = document.getElementById('upi-display');
  upiFrame.classList.toggle('hidden');
}

// ===================================================
// IN-APP MAP RENDERING ENGINE CONTROLLERS
// ===================================================
function launchInAppSearch() {
  const destInput = document.getElementById('map-custom-destination').value.trim();
  const mapIframe = document.getElementById('live-interactive-map');
  
  if (!destInput) {
    alert("Please enter a destination to search location parameters!");
    return;
  }
  
  const originAddress = encodeURIComponent("New Modern Mission");
  const destinationAddress = encodeURIComponent(destInput);
  
  mapIframe.src = `https://maps.google.com/maps?q=${destinationAddress}+near+${originAddress}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => chip.classList.remove('active'));
}

function handleMapSearchKey(event) {
  if (event.key === 'Enter') {
    launchInAppSearch();
  }
}

function updateFreeMap(amenityType) {
  const mapIframe = document.getElementById('live-interactive-map');
  const baseLocation = "New Modern Mission";
  
  mapIframe.src = `https://maps.google.com/maps?q=${amenityType}+near+${baseLocation}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => chip.classList.remove('active'));
  event.currentTarget.classList.add('active');
}

// ===================================================
// SERVERLESS INTERNET-CONNECTED AI CHAT COUPLING
// ===================================================
function handleChatKey(event) {
  if (event.key === 'Enter') { 
    submitUserMessage(); 
  }
}

// ROUTE INTENT CHIPS
function sendChipPrompt(text) {
  document.getElementById('user-chat-input').value = text;
  submitUserMessage();
}

async function submitUserMessage() {
  const txtBox = document.getElementById('user-chat-input');
  const rawMsg = txtBox.value.trim();
  if (!rawMsg) return;

  const logBox = document.getElementById('chat-log-box');
  
  // Append User message row
  logBox.innerHTML += `<div class="msg-bubble user-msg">${rawMsg}</div>`;
  txtBox.value = "";
  
  // Auto Scroll logs
  logBox.scrollTop = logBox.scrollHeight;

  // 1. Inject a temporary thinking/loading element placeholder
  const typingId = "ai-typing-indicator-" + Date.now();
  logBox.innerHTML += `<div class="msg-bubble bot-msg" id="${typingId}"><i>Thinking...</i></div>`;
  logBox.scrollTop = logBox.scrollHeight;

  const typingBubble = document.getElementById(typingId);

  try {
    // 2. Direct network context hand-off using Puter's optimized edge framework
    // System context prompt engineered specifically for Tasty & Comfort
    const contextualPrompt = `You are the friendly, high-tech AI Assistant for "Tasty & Comfort" (T&C), a premium stall located at New Modern Mission. 
    Stall Details to reference:
    - Hours: 6:00 AM to 10:00 PM daily.
    - Menu Items: Premium Tea (₹10), Crispy French Fries (Small Portion Salted: ₹50, Masala: ₹60; Big Portion Salted: ₹60, Masala: ₹70), Soft Sandwiches, and Crispy Punjabi Samosas (1 Piece Classic: ₹30, 2 Piece Box with Chutney: ₹55).
    - Features: Free Wheelchair assistance, First Aid, Fire Safety tracking, and an interactive "You Are Here" zone structural grid.
    Keep answers helpful, direct, and conversational.
    
    User Query: ${rawMsg}`;

    const aiReply = await puter.ai.chat(contextualPrompt);
    
    // Swap thinking state text with true live cloud response payload
    typingBubble.innerText = aiReply;

  } catch (error) {
    console.warn("Puter Cloud communication interrupted. Executing local structural state fallback arrays:", error);
    
    // 3. SECURE PRE-PROGRAMMED BACKEND FALLBACK
    let fallbackResponse = "I'm processing that request! For immediate queries about our fresh menu or exact directions, please tap the Menu or Map tabs.";
    const lowerMsg = rawMsg.toLowerCase();

    if (lowerMsg.includes('hour') || lowerMsg.includes('time')) {
      fallbackResponse = "Our stall is open from 6:00 AM to 10:00 PM every day! Drop by anytime for hot tea and crispy fries.";
    } else if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
      fallbackResponse = "Our Premium Tea is ₹10. Crispy French Fries start at just ₹50 for a small portion and ₹60 for a big portion!";
    } else if (lowerMsg.includes('location') || lowerMsg.includes('where')) {
      fallbackResponse = "We are located at New Modern Mission. Check out the 'You Are Here' tab to get direct navigation views on our live interactive map!";
    }
    
    typingBubble.innerText = fallbackResponse;
  }
  
  // Re-anchor chatbox viewport baseline
  logBox.scrollTop = logBox.scrollHeight;
}
