

// ===================================================
// SECTION VIEW MANAGER ENGINE
// ===================================================

function switchView(viewId, element) {
  // 1. NAVIGATION LOGIC
  const sections = document.querySelectorAll('.app-section');
  sections.forEach(sec => sec.classList.remove('active-view'));
  
  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.add('active-view');

  const sideItems = document.querySelectorAll('.side-item');
  sideItems.forEach(item => item.classList.remove('active'));
  
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.classList.remove('active'));

  if (element) element.classList.add('active');

  // 2. VIDEO CONTROL LOGIC (Moved outside the 'if (element)' block)
  const videoPlayer = document.getElementById('live-video-player');
if (videoPlayer) {
  if (viewId === 'chat-view') {
    // Correct format: Use 'embed/' and add 'autoplay=1&mute=1'
    videoPlayer.src = "https://www.youtube.com/embed/nI9U3Je3XAM?autoplay=1&mute=1";
  } else {
    // This correctly stops the video
    videoPlayer.src = ""; 
  }
 }
}

//www.youtube.com/live/PoIrmiY0yjU?si=8BlNaz5BIpY8kHX5
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
    const API_KEY = "AQ.Ab8RN6JbLJ8a8xNiL1Vq_msT-p8pg-nJHR6KpgfyU5vYol4Ihw"; 
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


// Parking alert system
let announcementActive = false;
let messageContent = "";

function checkAnnouncement() {
    fetch('announcement.json?t=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            const modal = document.getElementById('announcement-modal');
            const sound = document.getElementById('announcement-sound');
            
            if (data.status === 'active') {
                announcementActive = true;
                messageContent = data.message;
                
                if (modal.classList.contains('hidden')) {
                    document.getElementById('announcement-text').innerText = messageContent;
                    modal.classList.remove('hidden');
                    
                    // Trigger the sound
                    sound.play().catch(e => console.log("Audio play blocked by browser, user needs to click the page first."));
                }
            } else {
                announcementActive = false;
                modal.classList.add('hidden');
            }
        })
        .catch(error => console.log('Error:', error));
}


// 1. Run once immediately when the page loads
checkAnnouncement();

// 2. Check every 30 seconds
setInterval(checkAnnouncement, 60000);

function closeAnnouncement() {
    const modal = document.getElementById('announcement-modal');
    modal.classList.add('hidden');
    
    // "Nag" feature: reappear after 1 minute if still active
    if (announcementActive) {
        setTimeout(() => {
            if (announcementActive) {
                // Ensure text is set before showing
                document.getElementById('announcement-text').innerText = messageContent;
                modal.classList.remove('hidden');
            }
        }, 60000); 
    }
}


// Image Popup
function openMenuModal(imgSrc, title, price, type) {
    const modal = document.getElementById('menuModal');
    if (!modal) return;
    
    // Set color based on the type
    let dotColor;
    if (type === 'Veg') {
        dotColor = 'green';
    } else if (type === 'N.Veg') {
        dotColor = 'red';
    } else {
        dotColor = 'orange'; // Used for 'Both' or any other type
    }
    
    // Update the modal content
    modal.querySelector('img').src = imgSrc;
    modal.querySelector('h3').innerText = title;
    modal.querySelector('.price-tile').innerText = 'Price: ' + price;
    modal.querySelector('.type-tile').innerHTML = 
        'Type: ' + type + ' <span style="color: ' + dotColor + ';">●</span>';
    
    modal.showModal();
}




//Text, News & T&C live
async function fetchNews() {
    const container = document.getElementById('news-container');
    if (!container) return; // Safety check
    
    container.innerHTML = "<p>Loading...</p>";
    
    const urls = [
        'https://news.google.com/rss/search?q=Telangana&hl=en-IN&gl=IN',
        'https://news.google.com/rss/headlines/section/country/IN?hl=en-IN&gl=IN',
        'https://news.google.com/rss?hl=en-IN&gl=IN'
    ];

    try {
        let allNews = [];
        for (let url of urls) {
            let api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
            let response = await fetch(api);
            let data = await response.json();
            if (data.items) {
                allNews = allNews.concat(data.items.slice(0, 2));
            }
        }

        let html = '';
        allNews.forEach((item, index) => {
            let type = index < 2 ? "Telangana" : (index < 4 ? "India" : "World");
            let color = type === 'Telangana' ? '#ff9f43' : (type === 'India' ? '#00d4ff' : '#2ecc71');
            
            html += `<div class="news-item" style="padding: 10px 0; border-bottom: 1px solid #333;">
                        <span class="label" style="background:${color}33; color:${color}; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem;">[${type}]</span>
                        <a href="${item.link}" target="_blank" style="text-decoration: none; font-size: 0.9rem; color: #fff; margin-left: 8px;">${item.title}</a>
                     </div>`;
        });
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = "<p>Please check connection.</p>";
    }
}


// 2nd half
function setMode(mode, element) {
    // 1. Manage Button Highlighting
    document.querySelectorAll('.view-selector button').forEach(btn => {
        btn.classList.remove('active-mode');
    });
    if (element) {
        element.classList.add('active-mode');
    }

    // 2. Select Elements (Added wildlife and sports)
    const views = {
        text: document.getElementById('text-view'),
        video: document.getElementById('video-view'),
        live: document.getElementById('live-view'),
        wildlife: document.getElementById('wildlife-view'),
        sports: document.getElementById('sports-view')
    };
    
    const players = {
        news: document.getElementById('news-video-player'),
        live: document.getElementById('tc-live-player'),
        wildlife: document.getElementById('wildlife-player'),
        sports: document.getElementById('sports-player')
    };

    const title = document.getElementById('current-channel-title');
    const dot = document.getElementById('live-indicator');

    // 3. Reset all views and stop ALL players
    Object.keys(views).forEach(key => {
        if(views[key]) views[key].style.display = 'none';
    });
    Object.keys(players).forEach(key => {
        if(players[key]) players[key].src = "";
    });

    // 4. Activate chosen mode & Update Title/Dot
    if (mode === 'text') {
        title.innerText = "Latest Updates";
        dot.style.display = "none";
        views.text.style.display = 'block';
    } 
    else if (mode === 'video') {
        title.innerText = "Live NEWS";
        dot.style.display = "inline-block";
        views.video.style.display = 'block';
        players.news.src = "https://www.youtube.com/embed/e1FIApIafWE?autoplay=1&mute=1";
    } 
    else if (mode === 'live') {
        title.innerText = "T&C Live";
        dot.style.display = "inline-block";
        views.live.style.display = 'block';
        players.live.src = "https://www.youtube.com/embed/IzOOvR-XzAg?autoplay=1&mute=1";
    }
    // Added New Modes
    else if (mode === 'wildlife') {
        title.innerText = "Wild Live";
        dot.style.display = "inline-block";
        views.wildlife.style.display = 'block';
        players.wildlife.src = "https://www.youtube.com/embed/MiQe9ob9aDc?autoplay=1&mute=1";
    }
    else if (mode === 'sports') {
        title.innerText = "Sports Live";
        dot.style.display = "inline-block";
        views.sports.style.display = 'block';
        players.sports.src = "https://www.youtube.com/embed/fE_xxKiCHO0?autoplay=1&mute=1";
    }
}


// https://youtu.be/IzOOvR-XzAg?si=Wejt5kdTn-Kh1rew
// https://www.youtube.com/live/MiQe9ob9aDc?si=8j_VKUJ6F7B9i7vy
// https://www.youtube.com/live/-6aJD-4Yu4w?si=arobwb4tdTKjwmld
// https://www.youtube.com/live/fE_xxKiCHO0?si=lLv3s6P-AKr07hiC

//App Language
function changeLang(lang) {
    var combo = document.querySelector('.goog-te-combo');
    if (combo) {
        combo.value = lang;
        combo.dispatchEvent(new Event('change'));
    }
}


// Weather Fetching
window.addEventListener('load', async () => {
    console.log("Page loaded, starting weather fetch...");
    
    const display = document.getElementById('mobile-weather-display');
    if (!display) {
        console.error("CRITICAL ERROR: Could not find an element with id='mobile-weather-display'. Check your HTML!");
        return;
    }

    try {
        const apiKey = '238416beb1e4e9ee3e1c4c8f16fc2a2c';
        const url = `https://api.openweathermap.org/data/2.5/weather?q=Hyderabad&appid=${apiKey}&units=metric`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log("Weather data received:", data);
        
        // Update the display
        display.innerText = `${Math.round(data.main.temp)}°C ${data.weather[0].description}`;
    } catch (error) {
        console.error("Fetch failed:", error);
        display.innerText = "Weather unavailable";
    }
});

// Weather updates
async function fetchWeather() {
    const apiKey = '238416beb1e4e9ee3e1c4c8f16fc2a2c';
    const city = 'Hyderabad';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // 1. Prepare the Data
        const temp = `${Math.round(data.main.temp)}°C`;
        const cond = data.weather[0].description;
        
        // 2. Get the Dynamic Icon URL
        const iconCode = data.weather[0].icon; 
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        
        // 3. Define all targets
        const textElements = {
            'mobile-temp': temp,
            'desktop-temp': temp,
            'mobile-condition': cond,
            'desktop-condition': cond
        };
        
        const iconElements = ['mobile-icon', 'desktop-icon'];
        
        // 4. Update Text Elements
        for (const [id, value] of Object.entries(textElements)) {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        }
        
        // 5. Update Icons
        iconElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.src = iconUrl;
        });
        
    } catch (error) {
        console.error("Weather error:", error);
    }
}

// Run when page loads
window.addEventListener('load', fetchWeather);
// Update every 10 minutes (10 minutes * 60 seconds * 1000 milliseconds)
setInterval(fetchWeather, 600000);




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
