// Dynamic Section Controller
function switchView(sectionId, clickedElement) {
  // 1. Hide all main content views
  const sections = document.querySelectorAll('.app-section');
  sections.forEach(section => {
    section.classList.remove('active-view');
  });
  
  // 2. Project target section into visibility
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active-view');
  }

  // 3. Reset styling for BOTH Desktop Sidebar and Mobile Bottom Dock buttons
  const allNavButtons = document.querySelectorAll('.side-item, .nav-btn');
  allNavButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  // 4. Highlight current selection across the app interface layout matches
  const targetLabel = clickedElement.innerText || clickedElement.querySelector('span').innerText;
  allNavButtons.forEach(btn => {
    const btnLabel = btn.innerText || btn.querySelector('span').innerText;
    if(btnLabel.trim().toLowerCase() === targetLabel.trim().toLowerCase()) {
      btn.classList.add('active');
    }
  });
  
  // Shift window view smoothly back up to zero-line coordinates
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Services Live Display Unit Controller
function showService(title, descriptiveText) {
  const placeholder = document.getElementById('monitor-placeholder');
  const dataBlock = document.getElementById('monitor-data');
  const titleBox = document.getElementById('monitor-title');
  const descBox = document.getElementById('monitor-desc');

  if(placeholder) placeholder.classList.add('hidden');
  
  titleBox.innerText = title;
  descBox.innerText = descriptiveText;
  dataBlock.classList.remove('hidden');
}

// UPI Panel Display Layer Toggle Switcher
function toggleUpi() {
  const upiPanel = document.getElementById('upi-display');
  upiPanel.classList.toggle('hidden');
}


// ===================================================
// REAL-TIME CHAT ENGINE AUTOMATION RULES
// ===================================================

// Handles submitting the quick prompt chips
function sendChipPrompt(promptText) {
  processChatResponse(promptText);
}

// Handles checking keyboard Enter clicks inside input field
function handleChatKey(event) {
  if (event.key === 'Enter') {
    submitUserMessage();
  }
}

// Main processing sequence for string collection
function submitUserMessage() {
  const inputEl = document.getElementById('user-chat-input');
  const text = inputEl.value.trim();
  if (!text) return;
  
  inputEl.value = ''; // clear input
  processChatResponse(text);
}

// Renders the messages log step by step
function processChatResponse(userQuery) {
  const logBox = document.getElementById('chat-log-box');

  // 1. Append User Bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'msg-bubble user-msg';
  userBubble.innerText = userQuery;
  logBox.appendChild(userBubble);
  
  // Auto scroll terminal to current point
  logBox.scrollTop = logBox.scrollHeight;

  // 2. Generate Intelligent Bot Response matching keyword targets
  let replyText = "I see your message! I'm here to assist with store operations. Can you clarify your question about Fries & Vibes?";
  const queryLower = userQuery.toLowerCase();

  if (queryLower.includes('hour') || queryLower.includes('time') || queryLower.includes('open')) {
    replyText = "Fries & Vibes is open daily from 6:00 AM to 10:00 PM! Stop by anytime for hot tea and crispy fries.";
  } else if (queryLower.includes('menu') || queryLower.includes('price') || queryLower.includes('cost')) {
    replyText = "Our current specialty items are:\n• Premium Brewed Tea — ₹10\n• French Fries (Small Portion) — ₹50 (Salted) / ₹60 (Masala)\n• French Fries (Big Portion) — ₹60 (Salted) / ₹70 (Masala).";
  } else if (queryLower.includes('location') || queryLower.includes('where') || queryLower.includes('map')) {
    replyText = "We are located opposite the main medical wing coordinates next to the New Modern Mission layout framework. Check our 'You Are Here' map view tab for the live display viewport navigation.";
  } else if (queryLower.includes('service') || queryLower.includes('safe') || queryLower.includes('emergency') || queryLower.includes('rain')) {
    replyText = "We care about your safety! We provide emergency features including wheelchair access ramps, a certified first aid kit, fire safety measures, and free disposable raincoats during unexpected downpours.";
  } else if (queryLower.includes('health') || queryLower.includes('hospital')) {
    replyText = "Our outlet is strategically situated right across from the primary clinical lanes, establishing rapid emergency access lanes if medical attention is required.";
  }

  // 3. Append Simulated Typing delay layer
  setTimeout(() => {
    const botBubble = document.createElement('div');
    botBubble.className = 'msg-bubble bot-msg';
    botBubble.innerText = replyText;
    logBox.appendChild(botBubble);
    logBox.scrollTop = logBox.scrollHeight;
  }, 450);
}
// Function to update the free map embed based on chosen amenity filters
function updateFreeMap(amenityType) {
  const mapIframe = document.getElementById('live-interactive-map');
  const baseLocation = "New Modern Mission"; // Your stall's main anchoring coordinate
  
  // Update iframe source dynamically with a high zoom level (z=16 is roughly 1km view)
  mapIframe.src = `https://maps.google.com/maps?q=${amenityType}+near+${baseLocation}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  // Visual feedback: Update active class style across the buttons
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => chip.classList.remove('active'));
  
  // Find the clicked button and light it up
  event.currentTarget.classList.add('active');
}
