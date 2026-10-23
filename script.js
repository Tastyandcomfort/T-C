

// ===================================================
// MODULAR T&C INTELLIGENCE DESK (INF-SCALE ARCHITECTURE)
// ===================================================

const tcIntelCategories = [
  {
    id: 'risk-brief',
    title: '📊 National Risk & Instability Brief',
    borderColor: '#ef4444',
    badge: 'STABLE (50/100)',
    content: 'Active monitoring of regional security indicators, protest logs, and critical infrastructure telemetry across Indian transit corridors.'
  },
  {
    id: 'supply-chain',
    title: '🚢 Supply Chain & Maritime Corridors',
    borderColor: '#f59e0b',
    badge: 'ACTIVE DELAYS',
    content: 'Red Sea & Cape of Good Hope cargo detours adding 10–14 days to container timelines, sustaining baseline import costs.'
  },
  {
    id: 'forex-market',
    title: '💰 Forex & Commodity Markets',
    borderColor: '#eab308',
    badge: 'LIVE SPOT',
    content: 'Interbank exchange tracking active USD/INR fluctuation and raw staple procurement index for regional markets.'
  },
  {
    id: 'agri-climate',
    title: '🌾 Agri-Climate & Mandi Intelligence',
    borderColor: '#10b981',
    badge: 'NORMAL TRANSIT',
    content: 'Open-Meteo regional weather metrics synced with APMC Mandi grain storage moisture and transit clearances.'
  },
  {
    id: 'stall-telemetry',
    title: '🛡️ Stall Security & Operations',
    borderColor: '#38bdf8',
    badge: '100% OPERATIONAL',
    content: 'All automated T&C utility modules, safety equipment, and emergency first-aid inventories are fully synchronized.'
  }
  // YOU CAN ADD MORE SUB-CATEGORIES HERE FREELY IN THE FUTURE!
];

async function loadTandCIntelligenceHub() {
  const container = document.getElementById('intel-dynamic-content');
  if (!container) return;

  try {
    // Fetch live currency spot rates (100% free public endpoint)
    const fxRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const fxData = await fxRes.json();
    const usdInr = fxData.rates.INR ? fxData.rates.INR.toFixed(2) : "84.00";

    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    const dateStamp = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    let gridHtml = `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">`;

    tcIntelCategories.forEach(cat => {
      let liveDetail = cat.content;
      if (cat.id === 'forex-market') {
        liveDetail = `Live Interbank USD/INR rate is <strong>₹${usdInr}</strong>, influencing electronic component and edible oil import baselines.`;
      }

      gridHtml += `
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 14px; border-left: 3px solid ${cat.borderColor}; display: flex; flex-direction: column; justify-content: space-between; gap: 10px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h4 style="margin: 0; color: ${cat.borderColor}; font-size: 0.95rem;">${cat.title}</h4>
              <span style="font-size: 0.65rem; background: #0f172a; color: ${cat.borderColor}; padding: 2px 6px; border-radius: 4px; font-weight: bold; border: 1px solid ${cat.borderColor};">${cat.badge}</span>
            </div>
            <p style="margin: 0; font-size: 0.78rem; color: #cbd5e1; line-height: 1.4;">
              ${liveDetail}
            </p>
          </div>
          <div style="background: #0f172a; padding: 6px 8px; border-radius: 6px; font-size: 0.7rem; color: #94a3b8; display: flex; justify-content: space-between;">
            <span>Synced: ${timestamp}</span>
            <span style="color: #38bdf8;">${dateStamp}</span>
          </div>
        </div>
      `;
    });

    gridHtml += `</div>`;
    container.innerHTML = gridHtml;

  } catch (err) {
    container.innerHTML = `<div style="color: #ff5968; padding: 15px; font-size: 0.85rem;">Telemetry active. Live sync recovering.</div>`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadTandCIntelligenceHub();
});








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
    - Owner: Ofoo not again the same frustrating question, I'll tell you who he is, the man on the earth who always shouts at me😏 his name is something looks like this Murali.
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
      fallbackResponse = "We are not yet launched but once started our stall is open from 6:00 AM to 10:00 PM every day! 'Drop by' for cup of tea and crispy fries.";
    } else if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
      fallbackResponse = "Our Premium Tea is ₹10. Crispy French Fries start at just ₹50 for a small portion and ₹60 for a big portion and for full menu please click on menu option";
    } else if (lowerMsg.includes('location') || lowerMsg.includes('where')) {
      fallbackResponse = "We are currently not located on earth but in soon we will. Check out the 'You Are Here Map' section to get direct navigation views on our live interactive map!";
    } else if (lowerMsg.includes('who') || lowerMsg.includes('owner')) {
      fallbackResponse = "Ofoo not again the same frustrating question, I'll tell you who he is, the man on the earth who always shouts at me😏 his name is something looks like this Murali. If you want to know about him click on About and don't ask me I can't shut my mouth from shouting at him, top of all this don't let him know that I shouted!";
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




// T&C Live Vercel Proxy Feed Engine (Connects directly to your existing #news-container)
// Strict Single-Date Filter & Archive Link Engine
let currentScope = 'local';
let selectedNewsDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

function switchNewsScope(scope) {
  currentScope = scope;
  fetchNews();
}

function handleDateChange(inputElem) {
  const chosenDateStr = inputElem.value;
  const todayStr = new Date().toISOString().split('T')[0];

  if (chosenDateStr > todayStr) {
    alert("Sorry I don't have a time machine to help you with the future Hahaha 😄");
    inputElem.value = selectedNewsDate;
    return;
  }

  selectedNewsDate = chosenDateStr;
  fetchNews();
}

async function fetchNews() {
  const container = document.getElementById('news-container');
  if (!container) return;

  // Header controls bar with date picker
  const internalControlsHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
      
      <!-- Category Tabs (Telangana, India, World) -->
      <div style="display: flex; gap: 5px; flex-wrap: wrap;">
        <button onclick="switchNewsScope('local')" style="background: ${currentScope === 'local' ? '#f59e0b' : '#1e293b'}; color: ${currentScope === 'local' ? '#0f172a' : '#cbd5e1'}; border: ${currentScope === 'local' ? 'none' : '1px solid #475569'}; padding: 3px 8px; border-radius: 5px; font-weight: bold; font-size: 0.75rem; cursor: pointer;">
          📍 Telangana
        </button>
        <button onclick="switchNewsScope('india')" style="background: ${currentScope === 'india' ? '#f59e0b' : '#1e293b'}; color: ${currentScope === 'india' ? '#0f172a' : '#cbd5e1'}; border: ${currentScope === 'india' ? 'none' : '1px solid #475569'}; padding: 3px 8px; border-radius: 5px; font-weight: bold; font-size: 0.75rem; cursor: pointer;">
          🇮🇳 India
        </button>
        <button onclick="switchNewsScope('world')" style="background: ${currentScope === 'world' ? '#f59e0b' : '#1e293b'}; color: ${currentScope === 'world' ? '#0f172a' : '#cbd5e1'}; border: ${currentScope === 'world' ? 'none' : '1px solid #475569'}; padding: 3px 8px; border-radius: 5px; font-weight: bold; font-size: 0.75rem; cursor: pointer;">
          🌍 World
        </button>
      </div>

      <!-- Date Selector -->
      <div style="display: flex; align-items: center; gap: 4px; font-size: 0.72rem; color: #94a3b8; background: #0f172a; padding: 2px 6px; border-radius: 5px; border: 1px solid #334155;">
        <span>📅 Date:</span>
        <input type="date" value="${selectedNewsDate}" onchange="handleDateChange(this)" style="background: transparent; color: #38bdf8; border: none; font-size: 0.72rem; font-weight: bold; outline: none; cursor: pointer;">
      </div>

    </div>
  `;

  container.innerHTML = `
    ${internalControlsHtml}
    <div style="color: #ffd700; padding: 8px; font-size: 0.8rem;">
      <i class="fa-solid fa-spinner fa-spin"></i> Checking ${currentScope.toUpperCase()} news for ${selectedNewsDate}...
    </div>
  `;

  try {
    const res = await fetch(`https://news-lemon-two.vercel.app/api/news?scope=${currentScope}`);
    const xmlText = await res.text();
    const xml = new DOMParser().parseFromString(xmlText, "text/xml");
    const items = xml.querySelectorAll("item");

    if (!items || items.length === 0) throw new Error("No items found");

    // Top 3 World Highlights
    let worldHighlightsHtml = '';
    if (currentScope !== 'world') {
      try {
        const worldRes = await fetch(`https://news-lemon-two.vercel.app/api/news?scope=world`);
        const worldXmlText = await worldRes.text();
        const worldXml = new DOMParser().parseFromString(worldXmlText, "text/xml");
        const worldItems = worldXml.querySelectorAll("item");

        if (worldItems && worldItems.length > 0) {
          worldHighlightsHtml += `
            <div style="background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 6px; padding: 6px 8px; margin-bottom: 8px;">
              <div style="font-size: 0.7rem; color: #38bdf8; font-weight: bold; margin-bottom: 3px;">🌍 TOP 3 WORLD BREAKING NEWS</div>
          `;
          Array.from(worldItems).slice(0, 3).forEach(wItem => {
            const wRaw = wItem.querySelector("title")?.textContent || "";
            const wLink = wItem.querySelector("link")?.textContent || "#";
            let wTitle = wRaw;
            if (wRaw.includes(" - ")) {
              const parts = wRaw.split(" - ");
              parts.pop();
              wTitle = parts.join(" - ").trim();
            }
            worldHighlightsHtml += `
              <a href="${wLink}" target="_blank" rel="noopener" style="color: #e2e8f0; text-decoration: none; font-size: 0.78rem; display: block; margin-bottom: 2px; line-height: 1.25;">
                🔥 ${wTitle}
              </a>
            `;
          });
          worldHighlightsHtml += `</div>`;
        }
      } catch (err) {}
    }

    // STRICT DATE FILTERING: Match ONLY the selected date string (YYYY-MM-DD)
    const exactMatches = Array.from(items).filter(item => {
      const pubDateRaw = item.querySelector("pubDate")?.textContent || "";
      if (!pubDateRaw) return false;
      
      const itemDateObj = new Date(pubDateRaw);
      if (isNaN(itemDateObj)) return false;
      
      // Convert published date to YYYY-MM-DD in local time
      const itemDateStr = itemDateObj.toISOString().split('T')[0];
      return itemDateStr === selectedNewsDate;
    });

    let itemsHtml = '';

    if (exactMatches.length > 0) {
      // Display strictly matching articles for that exact selected date
      exactMatches.forEach(item => {
        const rawTitle = item.querySelector("title")?.textContent || "";
        const link = item.querySelector("link")?.textContent || "#";
        const pubDateRaw = item.querySelector("pubDate")?.textContent || "";

        let headline = rawTitle;
        let sourceName = "Google News";

        if (rawTitle.includes(" - ")) {
          const parts = rawTitle.split(" - ");
          sourceName = parts.pop().trim();
          headline = parts.join(" - ").trim();
        }

        let timeFormatted = "Live";
        let dateFormatted = "";
        if (pubDateRaw) {
          const dateObj = new Date(pubDateRaw);
          if (!isNaN(dateObj)) {
            timeFormatted = dateObj.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
            dateFormatted = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          }
        }

        itemsHtml += `
          <div class="news-item" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-left: 2px solid #f59e0b; padding: 8px 10px; border-radius: 6px; margin-bottom: 6px;">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 3px;">
              Published by <strong style="color: #f59e0b;">${sourceName}</strong> at <span style="color: #38bdf8;">${timeFormatted}</span> on <span style="color: #cbd5e1;">${dateFormatted}</span>.
            </div>
            <a href="${link}" target="_blank" rel="noopener" style="color: #f8fafc; text-decoration: none; font-size: 0.85rem; font-weight: 500; line-height: 1.35; display: block;">
              ${headline}
            </a>
          </div>
        `;
      });
    } else {
      // If selected date is older than Google News live RSS buffer, show custom archive helper
      const scopeLabel = currentScope === 'local' ? 'Telangana' : currentScope === 'india' ? 'India' : 'World';
      const searchArchiveUrl = `https://www.google.com/search?q=${encodeURIComponent(scopeLabel + ' news ' + selectedNewsDate)}&tbm=nws`;

      itemsHtml = `
        <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 8px; padding: 12px; text-align: center; color: #cbd5e1; margin-top: 6px;">
          <div style="font-size: 0.88rem; font-weight: bold; color: #f59e0b; margin-bottom: 6px;">
            Sorry, no live articles found for ${selectedNewsDate}
          </div>
          <p style="font-size: 0.78rem; color: #94a3b8; margin: 0 0 10px 0; line-height: 1.4;">
            T&C can help with recent 24–48hrs headlines only. For researchers seeking historical archives for <strong>${selectedNewsDate}</strong>:
          </p>
          <a href="${searchArchiveUrl}" target="_blank" rel="noopener" style="display: inline-block; background: #f59e0b; color: #0f172a; padding: 6px 14px; border-radius: 6px; font-weight: bold; font-size: 0.8rem; text-decoration: none;">
            Click here for ${scopeLabel} News for ${selectedNewsDate} →
          </a>
        </div>
      `;
    }

    container.innerHTML = `
      ${internalControlsHtml}
      ${worldHighlightsHtml}
      ${itemsHtml}
    `;

  } catch (e) {
    container.innerHTML = `
      ${internalControlsHtml}
      <div style="color: #ff5968; padding: 8px; font-size: 0.8rem;">Unable to load live feed. Click Refresh.</div>
    `;
  }
}

// Load on start
window.addEventListener('load', fetchNews);







// 2nd half
function setMode(mode, element) {
    // 1. Manage Button Highlighting
    document.querySelectorAll('.view-selector button').forEach(btn => {
        btn.classList.remove('active-mode');
    });
    if (element) {
        element.classList.add('active-mode');
    }

    // 2. Select Elements (Added music)
    const views = {
        text: document.getElementById('text-view'),
        video: document.getElementById('video-view'),
        live: document.getElementById('live-view'),
        wildlife: document.getElementById('wildlife-view'),
        sports: document.getElementById('sports-view'),
        music: document.getElementById('music-view') // New music view
    };
    
    const players = {
        news: document.getElementById('news-video-player'),
        live: document.getElementById('tc-live-player'),
        wildlife: document.getElementById('wildlife-player'),
        sports: document.getElementById('sports-player'),
        music: document.getElementById('music-player'),
        nasa: document.getElementById('nasa-video-player'),
        airport: document.getElementById('airport-player'),
        hindu: document.getElementById('hindu-player'),
        muslim: document.getElementById('muslim-player'),
        christian: document.getElementById('christian-video-player'),
        law: document.getElementById('law-video-player'),
        file: document.getElementById('file-video-player'),
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
    else {
        // Any mode other than 'text' is a video/audio medium, trigger the smart headphone reminder!
        checkAndShowHeadphonesNotice();

        if (mode === 'video') {
            title.innerText = "Live NEWS";
            dot.style.display = "inline-block";
            views.video.style.display = 'block';
            players.news.src = "https://www.youtube.com/embed/II_m28Bm-iM?autoplay=1&mute=1";
        } 
        else if (mode === 'live') {
            title.innerText = "T&C Live";
            dot.style.display = "inline-block";
            views.live.style.display = 'block';
            players.live.src = "https://www.youtube.com/embed/IzOOvR-XzAg?autoplay=1&mute=1";
        }
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
        else if (mode === 'music') {
            title.innerText = "Music";
            dot.style.display = "inline-block"; 
            // Fixed typo here to properly target views.music instead of views.sports
            if (views.music) views.music.style.display = 'block';
            players.music.src = "https://www.youtube.com/embed/VdG_RC1POC8?autoplay=1&mute=1";
        }
        else if (mode === 'nasa') {
            title.innerText = "NASA";
            dot.style.display = "inline-block";
            views.video.style.display = 'block';
            players.news.src = "https://www.youtube.com/embed/OKQEMp2555A?autoplay=1&mute=1";
        } 
        else if (mode === 'airport') {
            title.innerText = "Airside";
            dot.style.display = "inline-block";
            views.video.style.display = 'block';
            players.news.src = "https://www.youtube.com/embed/n4I0d44oBEs?autoplay=1&mute=1";
        } 
        else if (mode === 'hindu') {
            title.innerText = " Bhagavat Geetha";
            dot.style.display = "inline-block";
            views.video.style.display = 'block';
            players.news.src = "https://www.youtube.com/embed/FFtPSPByBmk?autoplay=1&mute=1";
        } 
        else if (mode === 'muslim') {
            title.innerText = "Khuran";
            dot.style.display = "inline-block";
            views.video.style.display = 'block';
            players.news.src = "https://www.youtube.com/embed/_1FpcN1U_KY?autoplay=1&mute=1";
        } 
        else if (mode === 'christian') {
            title.innerText = "Bibul";
            dot.style.display = "inline-block";
            views.video.style.display = 'block';
            players.news.src = "https://www.youtube.com/embed/dmgsOBr2lAA?autoplay=1&mute=1";
        } 
        else if (mode === 'law') {
            title.innerText = "Constitution";
            dot.style.display = "inline-block";
            views.video.style.display = 'block';
            players.news.src = "https://www.youtube.com/embed/U71NrLiWWjI?autoplay=1&mute=1";
        } 
        else if (mode === 'file') {
            title.innerText = "Media";
            dot.style.display = "inline-block";
            views.video.style.display = 'block';
            players.news.src = "Audi RS5.jpg";
        }
    }
}

// https://youtu.be/-aTWDnQttks?si=9fNdqun3qpwJRSSf
// src: "0cc97f69-41fe-4344-80ca-6668201e80fb-ezgif.com-crop.gif"
// https://youtu.be/IzOOvR-XzAg?si=Wejt5kdTn-Kh1rew
// https://www.youtube.com/live/MiQe9ob9aDc?si=8j_VKUJ6F7B9i7vy
// https://www.youtube.com/live/-6aJD-4Yu4w?si=arobwb4tdTKjwmld
// https://www.youtube.com/live/fE_xxKiCHO0?si=lLv3s6P-AKr07hiC
// https://www.youtube.com/live/QCwq5Lg7Xes?si=Zer6F4zIFHC9Z6SR
// https://www.youtube.com/live/e1FIApIafWE?si=ZtVRb0WntF9uYHZx
// https://youtu.be/-aTWDnQttks?si=SBTx1z6N_MK20dUw
// https://www.youtube.com/live/Gupg41GJlpo?si=tscBaxRnGJ5t4FPL
//News https://www.youtube.com/live/_jnDy56dehA?si=aTz02-wbLsCzXPDJ
//News https://www.youtube.com/live/II_m28Bm-iM?si=h5Z4hs2eCcPga8F2
//Music https://youtu.be/-yHCeSZ-Nik?si=szr11nVDBTFAZN8J
//Music https://youtu.be/x-GgFu-vEV8?si=uQ_aM0at8nkBAlYH
//Music https://youtu.be/VdG_RC1POC8?si=SmyWCW79SrZZ8ORV


// Selector bar of videos
function scrollToActiveTab(buttonElement) {
    const container = buttonElement.parentElement;
    
    // Calculate position to center or bring the active button into view
    const containerWidth = container.offsetWidth;
    const buttonLeft = buttonElement.offsetLeft;
    const buttonWidth = buttonElement.offsetWidth;
    
    // Smoothly scroll the container to center the active button
    container.scrollTo({
        left: buttonLeft - (containerWidth / 2) + (buttonWidth / 2),
        behavior: 'smooth'
    });
}

// Example usage inside your tab click listener:
document.querySelectorAll('.view-selector button').forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all, add to current
        document.querySelectorAll('.view-selector button').forEach(btn => btn.classList.remove('active-mode'));
        this.classList.add('active-mode');
        
        // Automatically scroll to keep it visible
        scrollToActiveTab(this);
    });
});



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




// Map updated
// 1. Your exact stall coordinates
const stallLat = 17.367761; 
const stallLng = 78.537016; 

const customAmenities = {
  'hospital': { name: 'TIMS Hospital', query: '17.369313, 78.536573' },
  'police station': { name: 'Saroor Nagar Police Station', query: '17.368289, 78.527748' },
  'fire station': { name: 'Malakpet Fire Station', query: '17.368435, 78.501937' },
  'metro station': { name: 'Chaitanyapuri Metro Station', query: '17.368154, 78.536516' }, 
  'bus station': { name: 'Bus Stop infront of Gautham Electrical Shop', query: '17.368161, 78.534952' },
  'atm': { name: '24*7 ATMs of SBI/ICICI/DCB', query: '17.368727, 78.533186' },
  'gas station': { name: 'Bharat Petroleum Bunk', query: '17.367467, 78.539245' }
};

let allModesData = { driving: [], walking: [] };
let currentMode = 'driving';
let routeLayers = [];
let destMarker = null;
let currentDestName = "";

// Initialize Leaflet Map
const map = L.map('map').setView([stallLat, stallLng], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'New Modern Mission by T&C'
}).addTo(map);

// Add Stall Marker
L.marker([stallLat, stallLng]).addTo(map)
  .bindPopup('<b>You are here Tasty & Comfort Stall</b>').openPopup();

// FORCE MAP TO RENDER AUTOMATICALLY ON LOAD (Multiple staggered intervals catch mobile browser layout delays)
function triggerMapRefresh() {
  if (typeof map !== 'undefined') {
    map.invalidateSize(true);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(triggerMapRefresh, 100);
  setTimeout(triggerMapRefresh, 400);
  setTimeout(triggerMapRefresh, 1000);
});

window.addEventListener('load', () => {
  setTimeout(triggerMapRefresh, 100);
  setTimeout(triggerMapRefresh, 500);
});



// Tab click function to fix the half-blank map rendering bug if switched later
function openMapView() {
  const mapView = document.getElementById('map-view');
  if (mapView) {
    mapView.style.display = 'block';
  }
  
  if (typeof map !== 'undefined') {
    setTimeout(function() {
      map.invalidateSize();
    }, 100);
  }
}

// Triggered when typing in the search bar
async function searchDestination() {
  const query = document.getElementById('destination-input').value.trim();
  if (!query) {
    alert("Please enter a destination, coordinates, or Plus Code!");
    return;
  }
  await fetchRouteData(query);
}

// Triggered when clicking amenity chips
async function searchAmenity(amenityKey) {
  const facility = customAmenities[amenityKey];
  if (!facility) return;

  document.getElementById('destination-input').value = facility.name;
  await fetchRouteData(facility.query, facility.name);
}

// Universal function that handles Lat/Lng, Plus Codes, Text Addresses, and "Near Me" searches
async function fetchRouteData(query, customDisplayName = null) {
  const infoBox = document.getElementById('route-info');
  infoBox.innerHTML = `
    <div class="card-placeholder">
      <span class="pulse-icon">⏳</span>
      <p>Resolving location and calculating routes...</p>
    </div>
  `;

  try {
    let destLat, destLng, destName;

    // 1. Check if query is raw lat/lng coordinates
    const latLngRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = query.match(latLngRegex);

    if (match) {
      destLat = parseFloat(match[1]);
      destLng = parseFloat(match[3]);
      destName = customDisplayName || `Coordinates (${destLat}, ${destLng})`;
    } else {
      // 2. Clean up search query safely
      let searchQuery = query.trim();
      const lowerQuery = searchQuery.toLowerCase();

      if (lowerQuery.includes('near')) {
        searchQuery = lowerQuery.replace(/near\s*me/g, '').replace(/near/g, '').trim();
      }

      // 3. Search via Nominatim globally
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=1`;
      const geoRes = await fetch(geoUrl);
      
      if (!geoRes.ok) throw new Error("Failed to connect to location search service.");
      
      const geoData = await geoRes.json();

      if (!geoData || geoData.length === 0) {
        infoBox.innerHTML = `<div class="card-placeholder"><p>Location not found. Try a valid address, city, or place name.</p></div>`;
        return;
      }

      destLat = parseFloat(geoData[0].lat);
      destLng = parseFloat(geoData[0].lon);
      destName = customDisplayName || geoData[0].display_name;
    }

    currentDestName = destName;

    if (destMarker) map.removeLayer(destMarker);
    destMarker = L.marker([destLat, destLng]).addTo(map)
      .bindPopup(`<b>${destName}</b>`).openPopup();

    // 4. Fetch routing data from OSRM safely
    const [driveRes, walkRes] = await Promise.all([
      fetch(`https://router.project-osrm.org/route/v1/driving/${stallLng},${stallLat};${destLng},${destLat}?overview=full&geometries=geojson&alternatives=true`),
      fetch(`https://router.project-osrm.org/route/v1/foot/${stallLng},${stallLat};${destLng},${destLat}?overview=full&geometries=geojson`)
    ]);

    const driveData = await driveRes.json();
    const walkData = await walkRes.json();

    if (driveData.code === "Ok" && walkData.code === "Ok") {
      allModesData.driving = driveData.routes;
      
      walkData.routes.forEach(route => {
        if (route.duration <= driveData.routes[0].duration) {
          route.duration = (route.distance / 1.25); 
        }
      });

      allModesData.walking = walkData.routes;
      
      currentMode = 'driving'; 
      renderRouteCard();
      drawRouteOnMap(currentMode, 0);
    } else {
      infoBox.innerHTML = `<div class="card-placeholder"><p>Could not calculate route paths for this location.</p></div>`;
    }

  } catch (err) {
    console.error("Route fetch error:", err);
    infoBox.innerHTML = `<div class="card-placeholder"><p>Something went wrong. Please check your spelling or connection.</p></div>`;
  }
}

// Fix map sizing bug on window resize
window.addEventListener('resize', () => { 
  if (typeof map !== 'undefined') {
    map.invalidateSize(); 
  }
});

function switchMode(mode) {
  currentMode = mode;
  renderRouteCard();
  drawRouteOnMap(currentMode, 0); 
}

function formatDuration(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  let parts = [];
  if (days > 0) {
    parts.push(`${days} day${days > 1 ? 's' : ''}`);
  }
  if (hours > 0 || days > 0) {
    parts.push(`${hours}h`);
  }
  parts.push(`${minutes}min`);

  return parts.join(' ');
}

function renderRouteCard() {
  const infoBox = document.getElementById('route-info');
  const routes = allModesData[currentMode];

  let optionsHtml = '';
  routes.forEach((route, index) => {
    const dist = (route.distance / 1000).toFixed(1);
    const timeFormatted = formatDuration(route.duration);
    const label = index === 0 ? "⚡ Shortest" : `🛣️ Alternative ${index + 1}`;
    
    optionsHtml += `
      <button class="route-option-btn ${index === 0 ? 'active-route' : ''}" onclick="switchRouteIndex(${index}, this)">
        <div style="font-weight:600; color:#ffd700;">${label}</div>
        <div>${dist} km (~${timeFormatted})</div>
      </button>
    `;
  });

  infoBox.innerHTML = `
    <div class="route-results-grid">
      <div class="destination-header">
        <span>📍</span>
        <div><strong>Destination:</strong> ${currentDestName}</div>
      </div>
      
      <div class="mode-switcher">
        <button class="mode-btn ${currentMode === 'driving' ? 'active-mode' : ''}" onclick="switchMode('driving')">🚗 Driving</button>
        <button class="mode-btn ${currentMode === 'walking' ? 'active-mode' : ''}" onclick="switchMode('walking')">🚶 Walking</button>
      </div>

      <div style="font-size:0.75rem; color:#8b949e;">Route suggestion:</div>
      <div class="route-options-group">
        ${optionsHtml}
      </div>
    </div>
  `;
}

function switchRouteIndex(index, btnElement) {
  document.querySelectorAll('.route-option-btn').forEach(b => b.classList.remove('active-route'));
  btnElement.classList.add('active-route');
  drawRouteOnMap(currentMode, index);
}

function drawRouteOnMap(mode, index) {
  routeLayers.forEach(layer => map.removeLayer(layer));
  routeLayers = [];

  const routes = allModesData[mode];
  
  routes.forEach((r, i) => {
    const color = i === index ? (mode === 'driving' ? '#34c759' : '#00c7be') : '#888888';
    const weight = i === index ? 5 : 3;
    const opacity = i === index ? 0.9 : 0.4;

    const layer = L.geoJSON(r.geometry, {
      style: { color: color, weight: weight, opacity: opacity }
    }).addTo(map);

    routeLayers.push(layer);
  });

  if (routeLayers[index]) {
    map.fitBounds(routeLayers[index].getBounds(), { padding: [50, 50] });
  }
}


// Automatically fix map tiles the exact moment the container finishes rendering
const mapContainerElement = document.getElementById('map');
if (mapContainerElement) {
  const observer = new ResizeObserver(() => {
    if (typeof map !== 'undefined') {
      map.invalidateSize();
    }
  });
  observer.observe(mapContainerElement);
}



// 🎧 headphones pop-up
// Track whether we already reminded them in this browser session
let hasShownHeadphones = false;

function checkAndShowHeadphonesNotice() {
  if (hasShownHeadphones) return; // Only show once per page load

  const modal = document.getElementById('smart-headphones-popup');
  if (modal) {
    hasShownHeadphones = true;
    modal.style.display = 'block';

    // Smart Auto-dismiss: hide automatically after 10 seconds if they don't click anything
    setTimeout(() => {
      dismissHeadphonesNotice(false);
    }, 10000);
  }
}

function dismissHeadphonesNotice(rememberChoice) {
  const modal = document.getElementById('smart-headphones-popup');
  if (modal) {
    modal.style.display = 'none';
  }
}







