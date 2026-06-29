// VIEW ROUTER NAVIGATION MECHANICS & SECURITY POPUPS
function switchView(viewId) {
  // Hide all sections
  document.querySelectorAll('.app-section').forEach(section => {
    section.classList.remove('active-view');
  });
  
  // Show target section
  const targetSection = document.getElementById(`${viewId}-view`);
  if (targetSection) {
    targetSection.classList.add('active-view');
  }

  // Update navbar styling states
  document.querySelectorAll('.side-item, .nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Handle active class tracking logic across sidebar and mobile nav
  // (Assuming identical naming conventions match text contents or positions)
  
  // TRIGGER PRIVACY ANNOUNCEMENTS
  if (viewId === 'ai-chat') {
    showApplePopup(
      "Privacy Verification", 
      "We don't ask for your personal information, and we highly recommend you not to share any personal details or secure credentials with the AI system.", 
      "fa-solid fa-user-shield"
    );
  } else if (viewId === 'compliance') {
    showApplePopup(
      "Sensitive Information", 
      "This section contains confidential corporate credentials, system certifications, and legal compliance documentation.", 
      "fa-solid fa-triangle-exclamation"
    );
  }
}

// APPLE ANNOUNCEMENT POPUP CONTROLLERS
function showApplePopup(title, message, iconClass) {
  const overlay = document.getElementById('apple-popup-overlay');
  document.getElementById('apple-popup-title').innerText = title;
  document.getElementById('apple-popup-message').innerText = message;
  document.getElementById('apple-popup-icon').className = iconClass;
  
  overlay.classList.remove('hidden');
}

function closeApplePopup() {
  document.getElementById('apple-popup-overlay').classList.add('hidden');
}

// IN-APP MAP RENDERING ENGINE CONTROLLERS
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
  
  document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
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

  document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
  if(event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }
}

// DIAGNOSTIC SERVICE CONSOLE LOGS
function triggerUtilityLog(serviceName) {
  const placeholder = document.getElementById('monitor-placeholder');
  placeholder.innerHTML = `
    <div style="width:100%">
      <h5 style="color:#fff; margin-bottom:4px;">Monitoring: ${serviceName}</h5>
      <p style="color:var(--neon-green); font-family:monospace; font-size:0.75rem;">
        [OK] Telemetry stream active... No anomalies detected on localized nodes.
      </p>
    </div>
  `;
}

// AI ENGINE CHAT CONSOLE FLOWS
function executeChat() {
  const inputEl = document.getElementById('chat-user-input');
  const history = document.getElementById('chat-history');
  const text = inputEl.value.trim();
  if(!text) return;

  // Append User message
  const uBubble = document.createElement('div');
  uBubble.className = "msg-bubble user-msg";
  uBubble.innerText = text;
  history.appendChild(uBubble);
  inputEl.value = "";

  // Mock reply response pipeline
  setTimeout(() => {
    const bBubble = document.createElement('div');
    bBubble.className = "msg-bubble bot-msg";
    bBubble.innerText = "Query processed under corporate privacy guidelines. Systems operational.";
    history.appendChild(bBubble);
    history.scrollTop = history.scrollHeight;
  }, 750);
}

function handleChatKey(e) { if(e.key === 'Enter') executeChat(); }
function sendPresetPrompt(promptText) {
  document.getElementById('chat-user-input').value = promptText;
  executeChat();
}

// PROFILE UTILS
function toggleUpi() {
  document.getElementById('upi-card').classList.toggle('hidden');
}
