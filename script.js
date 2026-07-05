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
// GEMINI NATIVE CHAT INTEGRATION (NO POPUPS)
// ===================================================
function handleChatKey(event) {
  if (event.key === 'Enter') { 
    submitUserMessage(); 
  }
}

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

  // Inject temporary thinking placeholder
  const typingId = "ai-typing-indicator-" + Date.now();
  logBox.innerHTML += `<div class="msg-bubble bot-msg" id="${typingId}"><i>Thinking...</i></div>`;
  logBox.scrollTop = logBox.scrollHeight;

  const typingBubble = document.getElementById(typingId);

  try {
    // Integrated verified Key from Google AI Studio
    const API_KEY = "AQ.Ab8RN6LTSdN1RwE8gkbiByzOSL-Nqs5DwSN0oVmx6YuCe9WKBQ"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const systemContext = `You are the friendly, high-tech AI Assistant for "Tasty & Comfort" (T&C), a premium stall located at New Modern Mission. 
    Stall Details to reference:
    - Hours: 6:00 AM to 10:00 PM daily.
    - Menu Items: Premium Tea (₹10), Crispy French Fries (Small Portion Salted: ₹50, Masala: ₹60; Big Portion Salted: ₹60, Masala: ₹70), Soft Sandwiches, and Crispy Punjabi Samosas (1 Piece Classic: ₹30, 2 Piece Box with Chutney: ₹55).
    - Features: Free Wheelchair assistance, First Aid, Fire Safety tracking, and an interactive "You Are Here" zone structural grid.
    Keep answers helpful, direct, short, and conversational.`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `${systemContext}\n\nUser Query: ${rawMsg}` }] 
        }]
      })
    });

    const data = await response.json();
    
    // Extract text from response payload
    const aiReply = data.candidates[0].content.parts[0].text;
    typingBubble.innerText = aiReply;

  } catch (error) {
    console.warn("Direct AI connection failed. Executing fallback:", error);
    
    // SECURE PRE-PROGRAMMED BACKEND FALLBACK (If key fails or connection drops)
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
  
  logBox.scrollTop = logBox.scrollHeight;
}


// STALL COORDINATES (Ensure these match your actual location!)
const STALL_COORDS = [17.3826, 78.3314]; 

// Initialize map
const STALL_COORDS = [17.3826, 78.3314];
const map = L.map('map-canvas').setView(STALL_COORDS, 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
L.marker(STALL_COORDS).addTo(map).bindPopup("Tasty & Comfort");

// Initialize Routing, but keep it hidden/inactive initially
let routeControl = L.Routing.control({
    waypoints: [L.latLng(STALL_COORDS)],
    routeWhileDragging: false, 
    addWaypoints: false
}).addTo(map);

// FIX: Ensure the routing container doesn't block the map
document.querySelector('.leaflet-routing-container').style.display = 'none';

async function triggerSearch() {
    const query = document.getElementById("map-custom-destination").value;
    if (!query) return;

    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.length > 0) {
        const dest = [data[0].lat, data[0].lon];
        routeControl.setWaypoints([L.latLng(STALL_COORDS), L.latLng(dest[0], dest[1])]);
    }
}







// Filter Function
async function findNearby(type) {
    markers.clearLayers(); // Clear previous search/filter results
    const url = `https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="${type}"](around:5000,${STALL_COORDS[0]},${STALL_COORDS[1]});out;`;
    const res = await fetch(url);
    const data = await res.json();

    data.elements.forEach(place => {
        const dist = map.distance(STALL_COORDS, [place.lat, place.lon]) / 1000;
        L.marker([place.lat, place.lon]).addTo(markers)
         .bindPopup(`${place.tags.name || type}<br>Dist: ${dist.toFixed(2)} km`);
    });
    statusDiv.innerHTML = `Showing nearby ${type}s`;
}







