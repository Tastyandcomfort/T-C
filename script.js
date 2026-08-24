

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

let cachedLocations = null;

async function loadLocationsData() {
  if (cachedLocations) return cachedLocations;
  try {
    const res = await fetch('locations.json');
    cachedLocations = await res.json();
  } catch (e) {
    console.warn("Could not load locations.json:", e);
    cachedLocations = [];
  }
  return cachedLocations;
}

async function updateFreeMap(amenityType) {
  const mapIframe = document.getElementById('live-interactive-map');
  const baseLocation = "New Modern Mission";
  
  mapIframe.src = `https://maps.google.com/maps?q=${amenityType}+near+${baseLocation}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => chip.classList.remove('active'));
  event.currentTarget.classList.add('active');

  // Render matching nearby-amenity cards from locations.json underneath the map.
  const listBox = document.getElementById('amenities-list');
  if (!listBox) return;

  if (amenityType === 'amenities') {
    listBox.innerHTML = '';
    return;
  }

  const allLocations = await loadLocationsData();
  const matches = allLocations.filter(loc => loc.Type === amenityType);

  if (matches.length === 0) {
    listBox.innerHTML = `<div class="amenity-empty">No listed ${amenityType.replace(/\+/g, ' ')} nearby yet — showing general area on the map above.</div>`;
    return;
  }

  listBox.innerHTML = matches.map(loc => `
    <div class="amenity-card" onclick="focusAmenity(${loc.Lat}, ${loc.Lng}, '${loc.Name.replace(/'/g, "\\'")}')">
      <i class="fa-solid fa-location-dot"></i>
      <div class="amenity-info">
        <div class="amenity-name">${loc.Name}</div>
        <div class="amenity-meta">Tap to view on map</div>
      </div>
    </div>
  `).join('');
}

function focusAmenity(lat, lng, name) {
  const mapIframe = document.getElementById('live-interactive-map');
  mapIframe.src = `https://maps.google.com/maps?q=${lat},${lng}(${encodeURIComponent(name)})&t=&z=17&ie=UTF8&iwloc=&output=embed`;
}

// ===================================================
// T&C AI ASSISTANT — RULE-BASED ENGINE (no external API, no key required)
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

// T&C menu data, kept in one place so it's easy to update as prices change.
const TC_MENU = [
  { name: "Mega Combo Deal", price: "₹65", type: "Veg" },
  { name: "Second Combo", price: "₹99", type: "Non-Veg" },
  { name: "Premium Tea", price: "₹10", type: "Veg" },
  { name: "French Fries", price: "₹50", type: "Veg" },
  { name: "Sandwich", price: "₹45", type: "Veg" },
  { name: "Samosa", price: "₹15", type: "Veg" },
  { name: "Roll", price: "₹30 & ₹40", type: "Veg & Non-Veg" },
  { name: "Bread Egg Omelet", price: "₹30", type: "Veg" },
  { name: "Puff", price: "₹15 / ₹20 / ₹25", type: "Veg & Non-Veg" },
  { name: "Noodles", price: "₹45", type: "Veg" },
  { name: "Lollipop", price: "₹40 / ₹60", type: "Non-Veg" }
];

function getRuleBasedReply(rawMsg) {
  const q = rawMsg.toLowerCase().trim();

  // Greeting
  if (/^(hi|hello|hey|namaste|hola)\b/.test(q)) {
    return "Hey there! Ask me about our menu, prices, hours, safety features, or how to find us at New Modern Mission.";
  }

  // Thanks
  if (/thank/.test(q)) {
    return "You're very welcome! Anything else I can help with?";
  }

  // Hours
  if (/hour|time|open|close/.test(q)) {
    return "We're open 6:00 AM to 10:00 PM every day — come by any time for hot tea and crispy fries!";
  }

  // Location
  if (/location|where|address|find you|near/.test(q)) {
    return "We're located at New Modern Mission. Tap the 📍 'You Are Here' tab for a live map and directions.";
  }

  // Contact
  if (/contact|phone|call|number/.test(q)) {
    return "You can reach us directly at +91 95539 04524 — tap the Contact button on the About page to call straight away.";
  }

  // Safety / accessibility features
  if (/wheelchair|accessib/.test(q)) {
    return "We offer free wheelchair assistance for any customer who needs it — no hidden charges.";
  }
  if (/first aid|medical|injury/.test(q)) {
    return "We keep a fully stocked First Aid kit on-site with pain relief essentials and bandages, ready if needed.";
  }
  if (/fire safety|extinguisher|safety/.test(q)) {
    return "Fire safety equipment is on-site and maintained — you can see our certification under the Certifications tab.";
  }
  if (/certificat|fssai|hygiene|license/.test(q)) {
    return "Our FSSAI, Hygiene, and Fire Safety certificates are all viewable under the Certifications tab for full transparency.";
  }

  // Menu / price lookup — check item names first
  const itemMatch = TC_MENU.find(item => q.includes(item.name.toLowerCase()));
  if (itemMatch) {
    return `${itemMatch.name} is ${itemMatch.price} (${itemMatch.type}). Want to see it on the Menu tab?`;
  }

  if (/menu|price|cost|combo|rate/.test(q)) {
    const list = TC_MENU.slice(0, 6).map(i => `${i.name} – ${i.price}`).join(", ");
    return `Here are a few of our items: ${list}, and more on the Menu tab. Ask me about any specific item for its exact price!`;
  }

  // Fallback
  return "I can help with menu prices, hours, location, contact info, or our safety certifications — try asking about one of those, or tap the Menu / Map tabs directly.";
}

function submitUserMessage() {
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

  // Small delay purely for a natural "typing" feel — this is local logic, no network call.
  setTimeout(() => {
    typingBubble.innerText = getRuleBasedReply(rawMsg);
    logBox.scrollTop = logBox.scrollHeight;
  }, 400 + Math.random() * 400);
}

/* ===================================================
   DISABLED: previous Gemini API integration.
   Kept here (inactive) at your request, NOT deleted.
   IMPORTANT: the real API key that was previously here has been
   removed from this block and replaced with a placeholder, because
   that key was already exposed in your public GitHub repo — anyone
   who viewed the page source could copy and use it. If you still
   have that key active in Google AI Studio, it should be revoked/
   rotated there regardless of what this code does, since it's
   already been publicly visible in your commit history.
   To re-enable: restore your own fresh key below and call
   submitUserMessageViaGemini() instead of submitUserMessage().
=================================================== */
/*
async function submitUserMessageViaGemini() {
  const txtBox = document.getElementById('user-chat-input');
  const rawMsg = txtBox.value.trim();
  if (!rawMsg) return;

  const logBox = document.getElementById('chat-log-box');
  logBox.innerHTML += `<div class="msg-bubble user-msg">${rawMsg}</div>`;
  txtBox.value = "";
  logBox.scrollTop = logBox.scrollHeight;

  const typingId = "ai-typing-indicator-" + Date.now();
  logBox.innerHTML += `<div class="msg-bubble bot-msg" id="${typingId}"><i>Thinking...</i></div>`;
  logBox.scrollTop = logBox.scrollHeight;
  const typingBubble = document.getElementById(typingId);

  try {
    const API_KEY = "YOUR_GEMINI_API_KEY_HERE"; // never commit a real key to a public repo
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
        contents: [{ parts: [{ text: `${systemContext}\n\nUser Query: ${rawMsg}` }] }]
      })
    });

    const data = await response.json();
    const aiReply = data.candidates[0].content.parts[0].text;
    typingBubble.innerText = aiReply;
  } catch (error) {
    console.warn("Gemini connection failed, falling back to rule-based reply:", error);
    typingBubble.innerText = getRuleBasedReply(rawMsg);
  }
  logBox.scrollTop = logBox.scrollHeight;
}
*/


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
    // New Music Mode Logic
    else if (mode === 'music') {
        title.innerText = "T&C Player";
        dot.style.display = "none"; // Music is not "live"
        views.music.style.display = 'block';
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




// Global variable to hold the audio object
let currentAudio = null;

// This sets up the song based on the mood selected
function selectMood(mood) {
    const playlist = {
        'Peace': 'David Kushner - Daylight (Official Music Video).mp3',
        'Rising': 'Rising-Song.mp3',
        'Chill': 'Chill-Song.mp3',
        'Attitude': 'Attitude-Song.mp3'
    };

    function askForHeadphones() {
        const confirmed = confirm("🎧 Please ensure your headphones are connected for the best experience. Click OK to continue.");
        
        if (confirmed) {
            // Only load the audio, no extra alert here
            if (playlist[mood]) {
                currentAudio = new Audio(playlist[mood]);
            }
        } else {
            // Keep the cycle until they click OK
            askForHeadphones(); 
        }
    }
    
    askForHeadphones();
}


// This manages the manual Play/Pause button
function togglePlay() {
    if (!currentAudio) return alert("Please select a mood first!");
    
    if (currentAudio.paused) {
        currentAudio.play();
        document.getElementById('play-pause').innerText = "⏸";
    } else {
        currentAudio.pause();
        document.getElementById('play-pause').innerText = "▶";
    }
}

// This manages the Skip buttons
function skip(seconds) {
    if (!currentAudio) return;
    currentAudio.currentTime += seconds;
}



    

    
          

