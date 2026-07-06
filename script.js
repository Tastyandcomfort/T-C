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
// GLOBAL VARIABLE FOR ROUTING
let activeRouteLayer = null; 

// Initialize Leaflet Map Engine centered on regional coords
let map = L.map('map').setView([17.414, 78.446], 6);
let searchMarker = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let hospitals = [];

// Fetch data from local configuration payload
fetch('care_locations.json')
  .then(r => r.json())
  .then(d => {
    hospitals = d;
    d.forEach(h => {
      L.marker([h.lat, h.lon]).addTo(map).bindPopup(`<b>${h.name}</b>`);
    });
  })
  .catch(err => console.error("Error loading JSON file structure:", err));

/* ==========================================================================
   FEATURE: DYNAMIC LONG-PRESS ON MAP TO SEARCH ENGINE
   ========================================================================== */
let pressTimer = null;

map.on('mousedown', function(e) {
  clearTimeout(pressTimer);
  pressTimer = setTimeout(function() {
    handleMapLongPress(e.latlng.lat, e.latlng.lng);
  }, 500); 
});

map.on('mouseup movestart zoomstart dragstart', function() {
  clearTimeout(pressTimer);
});

async function handleMapLongPress(clickedLat, clickedLng) {
  const inlineError = document.getElementById('search-error-toast');
  if (inlineError) inlineError.classList.add('hidden');

  document.getElementById("search").value = `${clickedLat.toFixed(4)}, ${clickedLng.toFixed(4)}`;
  document.getElementById('mac-spinner').classList.remove('hidden');

  try {
    const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickedLat}&lon=${clickedLng}&addressdetails=1`;
    let response = await fetch(reverseUrl, {
      headers: { 'User-Agent': 'FindNearCareHospitalApp/2.0 (murali.manohar@example.com)' }
    }).then(x => x.json());
    
    if (response && response.display_name) {
      const addr = response.address;
      const placeName = addr.village || addr.town || addr.suburb || addr.city || addr.neighbourhood || response.display_name.split(',')[0];
      document.getElementById("search").value = placeName;
    }
  } catch (err) {
    console.error("Reverse geocoding execution error:", err);
  }

  searchLocationDirectCoords(clickedLat, clickedLng);
}

async function searchLocationDirectCoords(targetLat, targetLon) {
  const inlineError = document.getElementById('search-error-toast');
  if (inlineError) inlineError.classList.add('hidden');

  document.getElementById('mac-spinner').classList.remove('hidden');
  document.getElementById('no-results-state').classList.add('hidden');
  document.getElementById("results").innerHTML = "";

  const workspacePanel = document.getElementById('gis-workspace-panel');
  if (workspacePanel) workspacePanel.classList.remove('hidden');

  try {
    const currentSearchVal = document.getElementById("search").value;
    map.setView([targetLat, targetLon], 12);
    setTimeout(() => { map.invalidateSize(); }, 200);
    
    if (searchMarker) map.removeLayer(searchMarker);
    searchMarker = L.marker([targetLat, targetLon]).addTo(map).bindPopup(`<b>Selected Point:</b> ${currentSearchVal}`).openPopup();

    let results = [];
    for (let h of hospitals) {
      const url = `https://router.project-osrm.org/route/v1/driving/${targetLon},${targetLat};${h.lon},${h.lat}?overview=false`;
      try {
        let r = await fetch(url).then(x => x.json());
        if (r.routes && r.routes.length > 0) {
          results.push({
            name: h.name,
            km: r.routes[0].distance / 1000,
            min: r.routes[0].duration / 60,
            lat: h.lat,
            lon: h.lon,
            gmap: h.gmap || h.googleMaps
          });
        }
      } catch (e) {
        console.error("Routing calculation framework failure:", e);
      }
    }

    if (results.length === 0) {
      clearViews();
      return;
    }

    renderSortedCards(results, targetLat, targetLon);

  } catch (error) {
    console.error("Coordinate routing error instance:", error);
    clearViews();
  } finally {
    document.getElementById('mac-spinner').classList.add('hidden');
  }
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    triggerSearch();
  }
}

function triggerSearch() {
  const query = document.getElementById("search").value;
  if (query.trim() !== "") {
    const dropdown = document.getElementById('suggestions-dropdown');
    if (dropdown) {
      dropdown.innerHTML = "";
      dropdown.classList.add('hidden');
    }
    searchLocation(query);
  }
}

function formatTravelTime(totalMinutes) {
  const mins = Math.round(totalMinutes);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

async function searchLocation(query) {
  const inlineError = document.getElementById('search-error-toast');
  if (inlineError) inlineError.classList.add('hidden');

  document.getElementById('mac-spinner').classList.remove('hidden');
  document.getElementById('no-results-state').classList.add('hidden');
  document.getElementById("results").innerHTML = "";

  const workspacePanel = document.getElementById('gis-workspace-panel');
  if (workspacePanel) workspacePanel.classList.remove('hidden');

  try {
    let cleanQuery = query.trim();

    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&limit=1`;
    let response = await fetch(geocodeUrl, {
      headers: { 'User-Agent': 'FindNearCareHospitalApp/2.0 (murali.manohar@example.com)' }
    }).then(x => x.json());

    if (!response || response.length === 0) {
      clearViews();
      return;
    }

    const targetLat = parseFloat(response[0].lat);
    const targetLon = parseFloat(response[0].lon);

    map.setView([targetLat, targetLon], 12);
    setTimeout(() => { map.invalidateSize(); }, 200);
    
    if (searchMarker) map.removeLayer(searchMarker);
    searchMarker = L.marker([targetLat, targetLon]).addTo(map).bindPopup(`<b>Search Location:</b> ${cleanQuery}`).openPopup();

    let results = [];
    for (let h of hospitals) {
      const url = `https://router.project-osrm.org/route/v1/driving/${targetLon},${targetLat};${h.lon},${h.lat}?overview=false`;
      try {
        let r = await fetch(url).then(x => x.json());
        if (r.routes && r.routes.length > 0) {
          results.push({
            name: h.name,
            km: r.routes[0].distance / 1000,
            min: r.routes[0].duration / 60,
            lat: h.lat,
            lon: h.lon,
            gmap: h.gmap || h.googleMaps
          });
        }
      } catch (e) {
        console.error("Routing lookup fault structural trace:", e);
      }
    }

    if (results.length === 0) {
      clearViews();
      return;
    }

    renderSortedCards(results, targetLat, targetLon);

  } catch (error) {
    console.error("Global operational logic error:", error);
    clearViews();
  } finally {
    document.getElementById('mac-spinner').classList.add('hidden');
  }
}

function renderSortedCards(results, targetLat, targetLon) {
  results.sort((a, b) => a.min - b.min);

  let html = "";
  results.forEach((x, index) => {
    // Fixed string interpolation typo here
    const mapsUrl = x.gmap || `https://www.google.com/maps/dir/?api=1&origin=${targetLat},${targetLon}&destination=${x.lat},${x.lon}&travelmode=driving`;
    const timeDisplay = formatTravelTime(x.min);
    const shareText = encodeURIComponent(`Closest Hospital found! 🏥 ${x.name} is ${x.km.toFixed(1)} km away (${timeDisplay}). Route: ${mapsUrl}`);
    
    const isNearest = index === 0 ? "nearest-card" : "";
    const badge = index === 0 ? `<span class="badge">⭐ NEAREST</span>` : "";

    html += `
    <div class="card ${isNearest}">
      <div class="card-header">
        <b>${x.name}</b> ${badge}
      </div>
      <div class="card-body">
        <span>🚗 ${x.km.toFixed(1)} km</span>
        <span style="color: rgba(255,255,255,0.15); margin: 0 4px;">|</span>
        <span>⏱️ ${timeDisplay}</span>
      </div>
      <div class="card-actions">
        <button class="action-btn local-navigate-btn" 
                type="button"
                data-start-lat="${targetLat}" 
                data-start-lng="${targetLon}" 
                data-end-lat="${x.lat}" 
                data-end-lng="${x.lon}">
          🗺️ Navigate
        </button>
        <button class="action-btn secondary" type="button" onclick="copyLink('${mapsUrl}')">🔗 Copy</button>
        <a class="action-btn wa-btn" target="_blank" href="https://api.whatsapp.com/send?text=${shareText}">💬 WhatsApp</a>
      </div>
    </div>`;
  });

  document.getElementById("results").innerHTML = html;
}

function showWelcomeState() {
  document.getElementById("results").innerHTML = "";
  document.getElementById('mac-spinner').classList.add('hidden');
  
  const inlineError = document.getElementById('search-error-toast');
  if (inlineError) inlineError.classList.add('hidden');

  const workspacePanel = document.getElementById('gis-workspace-panel');
  if (workspacePanel) workspacePanel.classList.add('hidden');

  document.getElementById('no-results-state').classList.remove('hidden');

  const mainText = document.querySelector('.radar-title');
  const subText = document.querySelector('.radar-subtitle');
  
  if (mainText) mainText.innerText = "A promise of 99.9% accuracy";
  if (subText) subText.innerText = "Search with city, town or area name to find near CARE.";
}

function clearViews() {
  document.getElementById("results").innerHTML = "";
  document.getElementById('mac-spinner').classList.add('hidden');
  
  const workspacePanel = document.getElementById('gis-workspace-panel');
  if (workspacePanel) workspacePanel.classList.add('hidden');

  document.getElementById('no-results-state').classList.remove('hidden');
  
  const mainText = document.querySelector('.radar-title');
  const subText = document.querySelector('.radar-subtitle');
  
  if (mainText) mainText.innerText = "Sorry Try again";
  if (subText) subText.innerText = "Check the spelling/choose from suggestions.";

  const inlineError = document.getElementById('search-error-toast');
  if (inlineError) {
    inlineError.innerHTML = `⚠️ Sorry Try again. Check the spelling/choose from suggestions.`;
    inlineError.classList.remove('hidden');
  }
}

function copyLink(url) {
  navigator.clipboard.writeText(url).then(() => {
    alert("Navigation route link copied to clipboard!");
  }).catch(err => {
    console.error("Could not copy string text: ", err);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  showWelcomeState();
});

/* ==========================================================================
   LOCAL MAP ROUTING INTERCEPT ENGINE (OSRM INTEGRATION)
   ========================================================================== */
document.addEventListener('click', function (event) {
  if (event.target && event.target.classList.contains('local-navigate-btn')) {
    event.preventDefault();
    event.stopPropagation();

    const startLat = parseFloat(event.target.getAttribute('data-start-lat'));
    const startLng = parseFloat(event.target.getAttribute('data-start-lng'));
    const endLat = parseFloat(event.target.getAttribute('data-end-lat'));
    const endLng = parseFloat(event.target.getAttribute('data-end-lng'));

    calculateLocalRoute(startLat, startLng, endLat, endLng);
  }
});

function calculateLocalRoute(startLat, startLng, endLat, endLng) {
  if (!map) return;
  if (activeRouteLayer) map.removeLayer(activeRouteLayer);

  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

  fetch(osrmUrl)
    .then(response => response.json())
    .then(data => {
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const geometryCoordinates = data.routes[0].geometry.coordinates;
        const leafletRouteCoords = geometryCoordinates.map(coord => [coord[1], coord[0]]);

        activeRouteLayer = L.polyline(leafletRouteCoords, {
          color: '#3b82f6',
          weight: 5,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        const fitBoundsLayout = L.latLngBounds([[startLat, startLng], [endLat, endLng]]);
        map.fitBounds(fitBoundsLayout, { padding: [50, 50] });
        setTimeout(() => { map.invalidateSize(); }, 150);
      } else {
        alert("Unable to compute driving metrics across map matrix.");
      }
    })
    .catch(error => console.error("OSRM Routing Fault:", error));
}

/* ==========================================================================
   INDIA-WIDE REALTIME SUGGESTIONS ENGINE (DEBOUNCE SPEED: 150MS)
   ========================================================================== */
let suggestionTimeout = null;

function handleInputSuggestions(event) {
  const query = event.target.value.trim();
  const dropdown = document.getElementById('suggestions-dropdown');

  const inlineError = document.getElementById('search-error-toast');
  if (inlineError) {
    inlineError.classList.add('hidden');
  }

  const mainText = document.querySelector('.radar-title');
  const subText = document.querySelector('.radar-subtitle');
  if (mainText) mainText.innerText = "A promise of 99.9 accuracy";
  if (subText) subText.innerText = "Search with city, town or area name to find near CARE.";

  clearTimeout(suggestionTimeout);

  if (query.length < 3) {
    dropdown.innerHTML = "";
    dropdown.classList.add('hidden');
    return;
  }

  suggestionTimeout = setTimeout(() => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&addressdetails=1&limit=5`;

    fetch(url, { 
      headers: { 
        'Accept-Language': 'en',
        'User-Agent': 'FindNearCareHospitalApp/2.0 (murali.manohar@example.com)'
      } 
    })
      .then(res => res.json())
      .then(data => {
        if (!data || data.length === 0) {
          dropdown.innerHTML = "";
          dropdown.classList.add('hidden');
          return;
        }

        dropdown.innerHTML = ""; 

        data.forEach(item => {
          const address = item.address;
          const placeName = address.village || address.town || address.suburb || address.city || address.neighbourhood || item.display_name.split(',')[0];
          const district = address.county || address.district || "";
          const state = address.state || "";

          let cleanMeta = [district, state].filter(Boolean).join(', ');
          let fullDisplayString = placeName + (cleanMeta ? `, ${cleanMeta}` : "");

          const row = document.createElement('div');
          row.className = 'suggestion-item';
          row.innerHTML = `
            <strong>${placeName}</strong>
            <span class="suggestion-meta">${cleanMeta ? cleanMeta : 'India'}</span>
          `;

          row.addEventListener('mousedown', function(e) {
            e.preventDefault(); 
            e.stopPropagation();
            selectSuggestion(fullDisplayString);
          });

          dropdown.appendChild(row);
        });

        dropdown.classList.remove('hidden');
      })
      .catch(err => console.error("Suggestions retrieval error:", err));
  }, 150); 
}

function selectSuggestion(value) {
  const inputElement = document.getElementById('search');
  if (inputElement) {
    inputElement.value = value;
  }
  
  const dropdown = document.getElementById('suggestions-dropdown');
  if (dropdown) {
    dropdown.innerHTML = "";
    dropdown.classList.add('hidden');
  }
  
  triggerSearch();
}

document.addEventListener('mousedown', function(e) {
  const dropdown = document.getElementById('suggestions-dropdown');
  if (e.target.id !== 'search' && dropdown) {
    dropdown.classList.add('hidden');
  }
});

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
