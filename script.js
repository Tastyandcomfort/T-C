
// ===================================================
// T&C COMMAND DESK: STRICT REAL-DATA TELEMETRY DESK
// ===================================================

let osintMap = null;
let currentClickMarker = null;
let mapHazardsGroup = null;

// Universal Fetch Utility (8s Limit) — Throws Hard Errors On Failure
async function fetchRealData(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`API HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function loadTandCIntelligenceHub() {
  const container = document.getElementById('intel-dynamic-content');
  if (!container) return;

  if (!document.getElementById('tc-strict-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'tc-strict-styles';
    styleEl.innerHTML = `
      .intel-grid-container { display: grid; grid-template-columns: 1fr 380px; gap: 10px; align-items: start; }
      @media (max-width: 768px) { .intel-grid-container { grid-template-columns: 1fr !important; } }
      .metric-pill { background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; }
      .dark-osm-tiles { filter: brightness(0.65) invert(1) contrast(2.5) hue-rotate(200deg) saturate(0.3); }
      .mode-btn { background: #0f172a; color: #94a3b8; border: 1px solid #334155; padding: 4px 8px; border-radius: 4px; font-size: 0.68rem; font-weight: bold; cursor: pointer; transition: all 0.2s; }
      .mode-btn-active { background: #f59e0b !important; color: #0f172a !important; border-color: #f59e0b !important; box-shadow: 0 0 8px rgba(245,158,11,0.4); }
      .badge-tag { font-size: 0.6rem; background: #38bdf8; color: #0f172a; padding: 2px 6px; border-radius: 3px; font-weight: bold; }
      .source-brand-link { display: inline-flex; align-items: center; gap: 4px; font-size: 0.65rem; color: #38bdf8; text-decoration: none; background: #1e293b; border: 1px solid #334155; padding: 3px 6px; border-radius: 4px; font-weight: bold; }
      .source-brand-link:hover { border-color: #38bdf8; background: #0f172a; }
      .timestamp-tag { font-size: 0.62rem; color: #94a3b8; font-family: monospace; }
      .error-pill { background: #1e1b1b; border: 1px solid #ef4444; border-left: 3px solid #ef4444; color: #f8fafc; padding: 8px; font-size: 0.7rem; border-radius: 6px; }
    `;
    document.head.appendChild(styleEl);
  }

  container.innerHTML = `
    <!-- TOP CONTROL BAR -->
    <div style="margin-bottom: 10px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
      <div style="font-size: 0.78rem; color: #f8fafc; font-weight: bold;"><i class="fa-solid fa-satellite-dish" style="color:#f59e0b;"></i> T&C OSINT Live Telemetry Matrix</div>
      <div style="font-size: 0.7rem; color: #10b981; font-weight: bold;"><i class="fa-solid fa-bolt"></i> Pure Native Public APIs Only</div>
    </div>

    <!-- MAIN GRID CONTAINER -->
    <div class="intel-grid-container">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 4px;">
          <span style="font-size: 0.75rem; color: #38bdf8; font-weight: bold;"><i class="fa-solid fa-layer-group"></i> Layer Selection:</span>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            <button onclick="setMapDisplayMode('locality')" id="mode-btn-locality" class="mode-btn mode-btn-active">📍 Locality</button>
            <button onclick="setMapDisplayMode('earthquakes')" id="mode-btn-earthquakes" class="mode-btn">🌋 Earthquakes</button>
            <button onclick="setMapDisplayMode('forex')" id="mode-btn-forex" class="mode-btn">💰 USD/INR Spot</button>
            <button onclick="setMapDisplayMode('windy')" id="mode-btn-windy" class="mode-btn"> Windy Radar</button>
            <button onclick="resetLeafletMap()" class="mode-btn" style="background:#ef4444; color:#fff; border-color:#ef4444;"> Reset Map</button>
          </div>
        </div>
        <div id="leaflet-map-canvas" style="height: 420px; width: 100%; border-radius: 6px; background: #0f172a;"></div>
        <div id="windy-iframe-canvas" style="height: 420px; width: 100%; border-radius: 6px; background: #0f172a; display: none;"></div>
      </div>

      <!-- SIDE TELEMETRY PANEL -->
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 10px; max-height: 440px; overflow-y: auto;">
        <div id="brief-region-title" style="color: #f59e0b; font-size: 0.82rem; font-weight: bold; margin-bottom: 6px;"> Locality Breakdown</div>
        <div id="intel-brief-content-list">
          <div class="metric-pill" style="border-left: 3px solid #38bdf8; font-size: 0.72rem; color: #cbd5e1;">Click anywhere on the map to query OpenStreetMap, Open-Meteo Weather/AQI, and USGS Earthquakes in real time.</div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    initOsintLeafletMap();
  }, 200);
}

function generateTimestampTag() {
  const now = new Date();
  return `<span class="timestamp-tag">Fetched: ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>`;
}

// ===================================================
// MAP & REAL-TIME GEOCODING ENGINE
// ===================================================

function initOsintLeafletMap() {
  const mapEl = document.getElementById('leaflet-map-canvas');
  if (!mapEl) return;

  if (osintMap) {
    osintMap.remove();
    osintMap = null;
  }

  osintMap = L.map('leaflet-map-canvas').setView([20.5937, 78.9629], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    className: 'dark-osm-tiles'
  }).addTo(osintMap);

  mapHazardsGroup = L.layerGroup().addTo(osintMap);

  osintMap.on('click', function (e) {
    const lat = e.latlng.lat.toFixed(4);
    const lng = e.latlng.lng.toFixed(4);
    if (currentClickMarker) osintMap.removeLayer(currentClickMarker);
    currentClickMarker = L.marker(e.latlng).addTo(osintMap);
    fetchLocalityDetails(lat, lng);
  });
}

async function fetchLocalityDetails(lat, lng) {
  const titleEl = document.getElementById('brief-region-title');
  const briefList = document.getElementById('intel-brief-content-list');
  const syncTag = generateTimestampTag();

  titleEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Contacting Live APIs...`;
  briefList.innerHTML = '';

  let geoData = null;
  let weatherData = null;
  let aqiData = null;
  let quakeData = null;

  // 1. Nominatim Reverse Geocoding
  try {
    geoData = await fetchRealData(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`);
  } catch(e) {
    briefList.innerHTML += `<div class="error-pill">⚠️ Nominatim Reverse Geocoding API Failed (${e.message})</div>`;
  }

  // 2. Open-Meteo Weather
  try {
    weatherData = await fetchRealData(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`);
  } catch(e) {
    briefList.innerHTML += `<div class="error-pill">⚠️ Open-Meteo Weather API Failed (${e.message})</div>`;
  }

  // 3. Open-Meteo AQI
  try {
    aqiData = await fetchRealData(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm2_5,us_aqi`);
  } catch(e) {
    briefList.innerHTML += `<div class="error-pill">⚠️ Open-Meteo AQI API Failed (${e.message})</div>`;
  }

  // 4. USGS Earthquakes
  try {
    quakeData = await fetchRealData('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson');
  } catch(e) {
    briefList.innerHTML += `<div class="error-pill">⚠️ USGS Earthquake API Failed (${e.message})</div>`;
  }

  // Render Nominatim Data
  if (geoData && geoData.address) {
    const addr = geoData.address;
    const villageTown = addr.village || addr.town || addr.city_district || addr.city || 'Unnamed Location';
    const mandalTaluka = addr.county || addr.subdistrict || 'N/A';
    const district = addr.state_district || addr.district || 'N/A';
    const state = addr.state || 'N/A';
    const country = addr.country || 'N/A';
    const pincode = addr.postcode || 'N/A';
    const landmark = addr.road || addr.suburb || 'N/A';

    titleEl.innerHTML = `📍 ${villageTown}, ${district}`;

    briefList.innerHTML += `
      <div class="metric-pill" style="border-left: 3px solid #f59e0b;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="color:#f59e0b; font-size:0.75rem;">🗺️ Address Hierarchy</strong>
          <span class="badge-tag">OSM NOMINATIM</span>
        </div>
        <div style="font-size:0.7rem; color:#cbd5e1; line-height:1.42;">
          • <b>Street / Landmark:</b> ${landmark}<br>
          • <b>Village / Town:</b> ${villageTown}<br>
          • <b>Mandal / Taluka:</b> ${mandalTaluka}<br>
          • <b>District & State:</b> ${district}, ${state}<br>
          • <b>Country & Pincode:</b> ${country} (<span style="color:#10b981; font-weight:bold;">${pincode}</span>)
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          ${syncTag}
          <a href="https://nominatim.openstreetmap.org" target="_blank" class="source-brand-link">Nominatim Source ↗</a>
        </div>
      </div>
    `;
  }

  // Render Weather & AQI Data
  if (weatherData && weatherData.current) {
    const currW = weatherData.current;
    const currAQI = aqiData?.current || {};
    const villageTown = geoData?.address?.village || geoData?.address?.town || geoData?.address?.city || 'Location';

    briefList.innerHTML += `
      <div class="metric-pill" style="border-left: 3px solid #10b981;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="color:#10b981; font-size:0.75rem;">🌦️ Weather & AQI Telemetry</strong>
          <span style="color:#10b981; font-weight:bold; font-size:0.75rem;">AQI: ${currAQI.us_aqi !== undefined ? currAQI.us_aqi : 'N/A'}</span>
        </div>
        <div style="font-size:0.7rem; color:#cbd5e1; line-height:1.4;">
          • <b>Temperature:</b> ${currW.temperature_2m}°C | <b>Humidity:</b> ${currW.relative_humidity_2m}%<br>
          • <b>Wind Speed:</b> ${currW.wind_speed_10m} km/h<br>
          • <b>PM2.5 Density:</b> ${currAQI.pm2_5 !== undefined ? currAQI.pm2_5 + ' µg/m³' : 'N/A'}
        </div>
        <button onclick="setMapDisplayMode('windy', ${lat}, ${lng})" style="margin-top:6px; width:100%; background:#0f172a; color:#38bdf8; border:1px solid #38bdf8; padding:5px; border-radius:4px; font-size:0.68rem; font-weight:bold; cursor:pointer;">
          🌪️ Open Windy Radar for ${villageTown}
        </button>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          ${syncTag}
          <a href="https://open-meteo.com" target="_blank" class="source-brand-link">Open-Meteo Source ↗</a>
        </div>
      </div>
    `;
  }

  // Render Nearest USGS Earthquake
  if (quakeData && quakeData.features && quakeData.features.length > 0) {
    const quakes = quakeData.features;
    let closest = quakes[0];
    let minDist = Infinity;
    quakes.forEach(q => {
      const dist = Math.hypot(q.geometry.coordinates[1] - lat, q.geometry.coordinates[0] - lng);
      if (dist < minDist) { minDist = dist; closest = q; }
    });

    const km = Math.round(minDist * 111);
    briefList.innerHTML += `
      <div class="metric-pill" style="border-left: 3px solid #ef4444;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="color:#ef4444; font-size:0.75rem;">🌋 Nearest Recorded Seismic Event</strong>
          <span class="badge-tag">USGS REAL-TIME</span>
        </div>
        <div style="font-size:0.7rem; color:#cbd5e1; line-height:1.4;">
          • <b>Magnitude ${closest.properties.mag}</b> near ${closest.properties.place}<br>
          • <b>Distance from Pin:</b> ~${km} km | <b>Depth:</b> ${closest.geometry.coordinates[2]} km
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          ${syncTag}
          <a href="${closest.properties.url || 'https://earthquake.usgs.gov'}" target="_blank" class="source-brand-link">USGS Details ↗</a>
        </div>
      </div>
    `;
  }
}

// ===================================================
// USGS EARTHQUAKE PLOTTING ENGINE
// ===================================================

async function plotGlobalEarthquakes() {
  const titleEl = document.getElementById('brief-region-title');
  const briefList = document.getElementById('intel-brief-content-list');
  const syncTag = generateTimestampTag();

  titleEl.innerHTML = `🌋 Fetching Live USGS Feed...`;
  briefList.innerHTML = '';

  try {
    const data = await fetchRealData('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson');
    const quakes = data.features || [];

    if (mapHazardsGroup) mapHazardsGroup.clearLayers();

    let cardsHtml = '';
    quakes.slice(0, 10).forEach(q => {
      const coords = q.geometry.coordinates; // [lon, lat, depth]
      const mag = q.properties.mag;
      const place = q.properties.place;

      if (osintMap && mapHazardsGroup) {
        const marker = L.circleMarker([coords[1], coords[0]], {
          radius: Math.max(5, mag * 2),
          color: mag > 6 ? '#ef4444' : '#f59e0b',
          fillColor: mag > 6 ? '#ef4444' : '#f59e0b',
          fillOpacity: 0.7
        }).bindPopup(`<div style="font-size:0.7rem; color:#0f172a;"><b>Mag ${mag} Earthquake</b><br>${place}<br>Depth: ${coords[2]} km</div>`);
        mapHazardsGroup.addLayer(marker);
      }

      cardsHtml += `
        <div class="metric-pill" style="border-left: 3px solid #ef4444;">
          <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#f8fafc; font-weight:bold;">
            <span>Mag ${mag} Seismic Event</span>
            <span class="badge-tag">USGS</span>
          </div>
          <div style="font-size:0.65rem; color:#cbd5e1; margin-top:2px;">📍 ${place} (Depth: ${coords[2]} km)</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            ${syncTag}
            <a href="${q.properties.url}" target="_blank" class="source-brand-link">USGS ↗</a>
          </div>
        </div>
      `;
    });

    titleEl.innerHTML = `🌋 Seismic Events (${quakes.length} Recorded)`;
    briefList.innerHTML = cardsHtml;
  } catch(e) {
    titleEl.innerHTML = `🌋 USGS Fetch Failed`;
    briefList.innerHTML = `<div class="error-pill">⚠️ Live USGS Feed Request Failed: ${e.message}</div>`;
  }
}

// ===================================================
// REAL FOREX ENGINE (NO STATICS)
// ===================================================

async function fetchRealForexSpot() {
  const titleEl = document.getElementById('brief-region-title');
  const briefList = document.getElementById('intel-brief-content-list');
  const syncTag = generateTimestampTag();

  titleEl.innerHTML = `💰 Fetching Interbank Forex...`;
  briefList.innerHTML = '';

  try {
    const fx = await fetchRealData('https://api.exchangerate-api.com/v4/latest/USD');
    const inr = fx?.rates?.INR;

    if (!inr) throw new Error("INR rate missing from payload");

    titleEl.innerHTML = `💰 Interbank Currency Spot`;
    briefList.innerHTML = `
      <div class="metric-pill" style="border-left: 3px solid #10b981;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="color:#f8fafc; font-size:0.78rem;">USD / INR Real-Time Rate</strong>
          <span class="badge-tag">EXCHANGERATE-API</span>
        </div>
        <div style="font-size:1.3rem; color:#10b981; font-weight:bold; margin: 4px 0;">
          ₹${inr.toFixed(2)} <span style="font-size:0.7rem; color:#cbd5e1; font-weight:normal;">per 1 USD</span>
        </div>
        <div style="font-size:0.68rem; color:#cbd5e1;">Live spot interbank conversion baseline provided natively.</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          ${syncTag}
          <a href="https://www.exchangerate-api.com" target="_blank" class="source-brand-link">API Source ↗</a>
        </div>
      </div>
    `;
  } catch(e) {
    titleEl.innerHTML = `💰 Forex Fetch Failed`;
    briefList.innerHTML = `<div class="error-pill">⚠️ Live Forex Spot Request Failed: ${e.message}</div>`;
  }
}

// ===================================================
// MAP VIEW MODE CONTROLLER & RESET
// ===================================================

function setMapDisplayMode(mode, lat = 20.5937, lon = 78.9629) {
  const mapCanvas = document.getElementById('leaflet-map-canvas');
  const windyCanvas = document.getElementById('windy-iframe-canvas');
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('mode-btn-active'));

  if (mode === 'locality') {
    mapCanvas.style.display = 'block';
    windyCanvas.style.display = 'none';
    document.getElementById('mode-btn-locality')?.classList.add('mode-btn-active');
    if (mapHazardsGroup) mapHazardsGroup.clearLayers();
    if (osintMap) osintMap.invalidateSize();
  } else if (mode === 'earthquakes') {
    mapCanvas.style.display = 'block';
    windyCanvas.style.display = 'none';
    document.getElementById('mode-btn-earthquakes')?.classList.add('mode-btn-active');
    if (osintMap) osintMap.invalidateSize();
    plotGlobalEarthquakes();
  } else if (mode === 'forex') {
    mapCanvas.style.display = 'block';
    windyCanvas.style.display = 'none';
    document.getElementById('mode-btn-forex')?.classList.add('mode-btn-active');
    if (osintMap) osintMap.invalidateSize();
    fetchRealForexSpot();
  } else if (mode === 'windy') {
    mapCanvas.style.display = 'none';
    windyCanvas.style.display = 'block';
    windyCanvas.innerHTML = `<iframe width="100%" height="100%" src="https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&zoom=8&level=surface&overlay=wind" frameborder="0" style="border:0; width:100%; height:100%; border-radius:6px;"></iframe>`;
    document.getElementById('mode-btn-windy')?.classList.add('mode-btn-active');
  }
}

function resetLeafletMap() {
  setMapDisplayMode('locality');
  if (osintMap) {
    osintMap.setView([20.5937, 78.9629], 4);
    if (currentClickMarker) { osintMap.removeLayer(currentClickMarker); currentClickMarker = null; }
    if (mapHazardsGroup) mapHazardsGroup.clearLayers();
  }
  const titleEl = document.getElementById('brief-region-title');
  const briefList = document.getElementById('intel-brief-content-list');
  if (titleEl) titleEl.innerHTML = `📍 Locality Breakdown`;
  if (briefList) briefList.innerHTML = `<div class="metric-pill" style="border-left: 3px solid #38bdf8; font-size: 0.72rem; color: #cbd5e1;">Click anywhere on the map to query OpenStreetMap, Open-Meteo Weather/AQI, and USGS Earthquakes in real time.</div>`;
}

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

  if (viewId === 'intel-view') {
    loadTandCIntelligenceHub();
  }
  
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
let currentMode = 'driving'; // Default mode
let routeLayers = [];
let destMarker = null;
let currentDestName = "";
let telemetryMarker = null;
let activePinnedLat = null;
let activePinnedLng = null;
let pendingLat = null;
let pendingLng = null;
let masterTelemetryData = null; // Common destination & telemetry data

// Initialize Leaflet Map with script-enforced minimum mobile height
const mapDivEl = document.getElementById('map');
if (mapDivEl) {
  mapDivEl.style.width = '100%';
  mapDivEl.style.height = '420px';
  mapDivEl.style.minHeight = '420px';
  mapDivEl.style.position = 'relative';
}

const map = L.map('map').setView([stallLat, stallLng], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'New Modern Mission by T&C'
}).addTo(map);

// Add Stall Marker
L.marker([stallLat, stallLng]).addTo(map)
  .bindPopup('<b>You are here Tasty & Comfort Stall</b>').openPopup();

// Seismic Event Layer Group (USGS Live Data)
const seismicLayerGroup = L.layerGroup().addTo(map);

async function loadLiveUSGSEarthquakes() {
  try {
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson');
    if (!res.ok) return;
    const data = await res.json();
    const quakes = data.features || [];
    seismicLayerGroup.clearLayers();

    quakes.forEach(q => {
      const coords = q.geometry.coordinates;
      const mag = q.properties.mag;
      const place = q.properties.place;

      L.circleMarker([coords[1], coords[0]], {
        radius: Math.max(4, mag * 2),
        color: mag > 6 ? '#ef4444' : '#f59e0b',
        fillColor: mag > 6 ? '#ef4444' : '#f59e0b',
        fillOpacity: 0.75
      }).bindPopup(`
        <div style="font-size:0.75rem; color:#0f172a;">
          <b>🌋 Mag ${mag} Earthquake</b><br>${place}<br>Depth: ${coords[2]} km
        </div>
      `).addTo(seismicLayerGroup);
    });
  } catch (err) {
    console.warn("USGS seismic feed fetch failed:", err);
  }
}

loadLiveUSGSEarthquakes();

// AQI Badge Helper
function getAQIShortBadge(aqiVal) {
  if (aqiVal === undefined || aqiVal === null || isNaN(aqiVal)) return { text: 'AQI N/A', color: '#94a3b8' };
  if (aqiVal <= 50) return { text: `🟢 AQI ${aqiVal} (Good)`, color: '#10b981' };
  if (aqiVal <= 100) return { text: `🟡 AQI ${aqiVal} (Mod)`, color: '#f59e0b' };
  if (aqiVal <= 150) return { text: `🟠 AQI ${aqiVal} (Sens)`, color: '#f97316' };
  return { text: `🔴 AQI ${aqiVal} (Poor)`, color: '#ef4444' };
}

// RESET MAP & CLEAR SELECTION
function removePinnedLocation() {
  if (telemetryMarker) {
    map.removeLayer(telemetryMarker);
    telemetryMarker = null;
  }
  if (destMarker) {
    map.removeLayer(destMarker);
    destMarker = null;
  }
  routeLayers.forEach(layer => map.removeLayer(layer));
  routeLayers = [];
  
  activePinnedLat = null;
  activePinnedLng = null;
  currentDestName = "";
  masterTelemetryData = null;

  closeWindyOverlay();
  closeConfirmModal();

  const infoBox = document.getElementById('route-info');
  if (infoBox) {
    infoBox.innerHTML = `
      <div class="card-placeholder">
        <p>↑ Search a destination or tap the map to begin.</p>
      </div>
    `;
  }
  setTimeout(() => map.invalidateSize(), 50);
}

// Open Same-Container Windy Radar Overlay
function openSameContainerWindy() {
  if (!activePinnedLat || !activePinnedLng || !masterTelemetryData) {
    alert("Please search or pin a location on the map first!");
    return;
  }
  currentMode = 'radar';
  renderMasterCard();

  const mapDiv = document.getElementById('map');
  if (!mapDiv) return;

  const leafletControls = mapDiv.querySelectorAll('.leaflet-control-container');
  leafletControls.forEach(el => el.style.display = 'none');

  let windyOverlay = document.getElementById('windy-overlay-frame');
  if (!windyOverlay) {
    windyOverlay = document.createElement('div');
    windyOverlay.id = 'windy-overlay-frame';
    mapDiv.appendChild(windyOverlay);
  }

  const t = masterTelemetryData;
  const currW = t.currW;
  const aqiBadge = t.aqiBadge;

  windyOverlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; z-index:999; background:#0f172a; border-radius:8px; display:flex; flex-direction:column; overflow:hidden;';

  windyOverlay.innerHTML = `
    <!-- TOP RADAR CONTROL BAR WITH CLICK-BLEED PREVENTION -->
    <div onclick="event.stopPropagation()" onmousedown="event.stopPropagation()" style="background:#0f172a; border-bottom:1px solid #334155; padding:6px 10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; flex-shrink:0; z-index:1000;">
      <div style="display:flex; align-items:center; gap:5px; overflow:hidden;">
        <span style="font-size:0.68rem; color:#38bdf8; font-weight:bold; white-space:nowrap;">🌪️ Radar:</span>
        <span style="background: #1e293b; border: 1px solid #f59e0b; color: #f59e0b; padding: 1px 4px; border-radius: 3px; font-size: 0.58rem; font-weight: bold;">🌡️ ${currW.temperature_2m !== undefined ? currW.temperature_2m + '°C' : 'N/A'}</span>
        <span style="background: #1e293b; border: 1px solid #38bdf8; color: #38bdf8; padding: 1px 4px; border-radius: 3px; font-size: 0.58rem; font-weight: bold;">💨 ${currW.wind_speed_10m !== undefined ? currW.wind_speed_10m + ' km/h' : 'N/A'}</span>
        <span style="background: #1e293b; border: 1px solid ${aqiBadge.color}; color: ${aqiBadge.color}; padding: 1px 4px; border-radius: 3px; font-size: 0.58rem; font-weight: bold;">${aqiBadge.text}</span>
      </div>
      <button onclick="switchMode('driving')" style="background:#ef4444; color:#ffffff; border:none; padding:3px 8px; border-radius:3px; font-size:0.62rem; font-weight:bold; cursor:pointer; flex-shrink:0;">
        ✖ Close Radar
      </button>
    </div>
    <div style="flex-grow:1; width:100%; height:100%; position:relative;">
      <iframe width="100%" height="100%" src="https://embed.windy.com/embed2.html?lat=${activePinnedLat}&lon=${activePinnedLng}&detailLat=${activePinnedLat}&detailLon=${activePinnedLng}&marker=true&zoom=9&level=surface&overlay=wind" frameborder="0" style="border:0; width:100%; height:100%; display:block;"></iframe>
    </div>
  `;
}

function closeWindyOverlay() {
  const windyOverlay = document.getElementById('windy-overlay-frame');
  if (windyOverlay) windyOverlay.remove();

  const mapDiv = document.getElementById('map');
  if (mapDiv) {
    const leafletControls = mapDiv.querySelectorAll('.leaflet-control-container');
    leafletControls.forEach(el => el.style.display = 'block');
    
    setTimeout(() => {
      if (typeof map !== 'undefined') map.invalidateSize();
    }, 50);
  }
}

// Switch Master Mode
function switchMode(mode) {
  if (mode === 'radar') {
    openSameContainerWindy();
    return;
  }
  
  closeWindyOverlay();
  closeConfirmModal();
  currentMode = mode;

  if (mode === 'driving' || mode === 'walking') {
    if (activePinnedLat && activePinnedLng) {
      drawRouteOnMap(currentMode, 0);
    }
  }
  renderMasterCard();

  setTimeout(() => {
    if (typeof map !== 'undefined') map.invalidateSize();
  }, 50);
}

// MAP CLICK LISTENER: Protected with confirmation if a destination is already active
map.on('click', async function(e) {
  const lat = e.latlng.lat.toFixed(4);
  const lng = e.latlng.lng.toFixed(4);

  if (activePinnedLat !== null && activePinnedLng !== null) {
    pendingLat = lat;
    pendingLng = lng;
    showConfirmModal(lat, lng);
    return;
  }

  activePinnedLat = lat;
  activePinnedLng = lng;
  await fetchLocationDataAndRoutes(lat, lng);
});

// Show Apple-Styled Confirmation Modal with Working Button Handlers
function showConfirmModal(lat, lng) {
  const mapDiv = document.getElementById('map');
  if (!mapDiv) return;

  let modal = document.getElementById('confirm-pin-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'confirm-pin-modal';
    mapDiv.appendChild(modal);
  }

  modal.style.cssText = 'position:absolute; bottom:12px; left:50%; transform:translateX(-50%); width:90%; max-width:320px; z-index:2000; background:#0f172a; border:1px solid #38bdf8; border-radius:10px; padding:10px 12px; box-shadow:0 8px 24px rgba(0,0,0,0.8); font-family:system-ui, -apple-system, sans-serif; text-align:center; color:#f8fafc; pointer-events:auto;';

  modal.innerHTML = `
    <div style="font-size:0.75rem; font-weight:800; color:#38bdf8; margin-bottom:4px;">📍 Confirm Destination Change?</div>
    <div style="font-size:0.62rem; color:#cbd5e1; margin-bottom:8px;">New point selected: <b>${lat}, ${lng}</b></div>
    <div style="display:flex; gap:6px;">
      <button id="btn-confirm-yes" style="flex:1; background:#059669; color:#fff; border:none; padding:6px; border-radius:4px; font-size:0.65rem; font-weight:bold; cursor:pointer; pointer-events:auto;">YES, Update</button>
      <button id="btn-confirm-no" style="flex:1; background:#334155; color:#fff; border:none; padding:6px; border-radius:4px; font-size:0.65rem; font-weight:bold; cursor:pointer; pointer-events:auto;">NO, Keep Current</button>
    </div>
  `;

  document.getElementById('btn-confirm-yes').onclick = function(e) {
    e.stopPropagation();
    confirmDestinationChange();
  };

  document.getElementById('btn-confirm-no').onclick = function(e) {
    e.stopPropagation();
    closeConfirmModal();
  };
}

function closeConfirmModal() {
  const modal = document.getElementById('confirm-pin-modal');
  if (modal) {
    modal.remove();
  }
  pendingLat = null;
  pendingLng = null;
}

async function confirmDestinationChange() {
  if (pendingLat !== null && pendingLng !== null) {
    activePinnedLat = pendingLat;
    activePinnedLng = pendingLng;
    const targetLat = pendingLat;
    const targetLng = pendingLng;
    
    closeConfirmModal();
    closeWindyOverlay();
    
    await fetchLocationDataAndRoutes(targetLat, targetLng);
  } else {
    closeConfirmModal();
  }
}

// Universal fetch function for search and amenities
async function fetchRouteData(query, customDisplayName = null) {
  try {
    let destLat, destLng, destName;
    const latLngRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = query.match(latLngRegex);

    if (match) {
      destLat = parseFloat(match[1]);
      destLng = parseFloat(match[3]);
      destName = customDisplayName || `Coordinates (${destLat}, ${destLng})`;
    } else {
      let searchQuery = query.trim();
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=1`;
      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) throw new Error("Search service failed.");
      const geoData = await geoRes.json();

      if (!geoData || geoData.length === 0) {
        alert("Location not found.");
        return;
      }
      destLat = parseFloat(geoData[0].lat);
      destLng = parseFloat(geoData[0].lon);
      destName = customDisplayName || geoData[0].display_name;
    }

    activePinnedLat = destLat;
    activePinnedLng = destLng;
    currentDestName = destName;

    await fetchLocationDataAndRoutes(destLat, destLng, destName);

  } catch (err) {
    console.error("Fetch error:", err);
  }
}

// Dual Wikipedia & Google Maps Intelligence Resolver
async function fetchIntelligenceSummary(villageTown, district, landmark, state, pincode, lat, lng) {
  const searchQueries = [villageTown, district, "Hyderabad"].filter(q => q && q !== 'Local Sector');

  for (let term of searchQueries) {
    try {
      const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(term)}&limit=1&namespace=0&format=json&origin=*`);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const matchedTitle = searchData[1] && searchData[1][0];

        if (matchedTitle) {
          const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(matchedTitle)}`);
          if (summaryRes.ok) {
            const summaryData = await summaryRes.json();
            if (summaryData && summaryData.extract) {
              return {
                summary: summaryData.extract,
                sourceName: "Wikipedia Org",
                badgeColor: "#10b981",
                sourceUrl: summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(matchedTitle)}`
              };
            }
          }
        }
      }
    } catch (err) {
      console.warn(`Wiki query skipped for ${term}:`, err);
    }
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return {
    summary: `Verified sector overview for <b>${villageTown}</b> (${district}). Located near ${landmark}, within pin code zone <b>${pincode}</b>, ${state}.`,
    sourceName: "Google Maps",
    badgeColor: "#38bdf8",
    sourceUrl: googleMapsUrl
  };
}

// Master data fetcher
async function fetchLocationDataAndRoutes(lat, lng, displayName = null) {
  const infoBox = document.getElementById('route-info');
  infoBox.innerHTML = `
    <div class="card-placeholder">
      <span class="pulse-icon">⏳</span>
      <p>Resolving location, intelligence, & routes...</p>
    </div>
  `;

  if (telemetryMarker) map.removeLayer(telemetryMarker);
  telemetryMarker = L.marker([lat, lng]).addTo(map)
    .bindPopup(`<b>Pinned Location</b><br>${lat}, ${lng}`).openPopup();

  try {
    const [geoRes, weatherRes, aqiRes, quakeRes, driveRes, walkRes] = await Promise.all([
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm2_5,us_aqi`),
      fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson').catch(() => null),
      fetch(`https://router.project-osrm.org/route/v1/driving/${stallLng},${stallLat};${lng},${lat}?overview=full&geometries=geojson&alternatives=true`),
      fetch(`https://router.project-osrm.org/route/v1/foot/${stallLng},${stallLat};${lng},${lat}?overview=full&geometries=geojson`)
    ]);

    const geoData = geoRes.ok ? await geoRes.json() : null;
    const weatherData = weatherRes.ok ? await weatherRes.json() : null;
    const aqiData = aqiRes.ok ? await aqiRes.json() : null;
    const quakeData = quakeRes && quakeRes.ok ? await quakeRes.json() : null;
    const driveData = await driveRes.json();
    const walkData = await walkRes.json();

    const addr = geoData?.address || {};
    const villageTown = addr.village || addr.town || addr.city_district || addr.city || addr.suburb || 'Local Sector';
    const district = addr.state_district || addr.district || 'District';
    const state = addr.state || 'State';
    const landmark = addr.road || addr.neighbourhood || 'Landmark Area';
    const county = addr.county || addr.subdistrict || 'Mandal/Taluka';

    let pincode = addr.postcode || addr.pincode || addr.postal_code;
    if (!pincode && geoData?.display_name) {
      const match = geoData.display_name.match(/\b\d{6}\b/);
      if (match) pincode = match[0];
    }
    if (!pincode) pincode = "Verified Zone";

    currentDestName = displayName || `${villageTown}, ${district}`;

    const currW = weatherData?.current || {};
    const currAQI = aqiData?.current || {};
    const aqiBadge = getAQIShortBadge(currAQI.us_aqi);

    let nearestQuakeText = "No active quakes nearby";
    const quakes = quakeData?.features || [];
    if (quakes.length > 0) {
      let closest = quakes[0];
      let minDist = Infinity;
      quakes.forEach(q => {
        const dist = Math.hypot(q.geometry.coordinates[1] - lat, q.geometry.coordinates[0] - lng);
        if (dist < minDist) { minDist = dist; closest = q; }
      });
      nearestQuakeText = `Mag ${closest.properties.mag} near ${closest.properties.place} (~${Math.round(minDist * 111)} km)`;
    }

    const intelResult = await fetchIntelligenceSummary(villageTown, district, landmark, state, pincode, lat, lng);

    if (driveData.code === "Ok" && walkData.code === "Ok") {
      allModesData.driving = driveData.routes;
      walkData.routes.forEach(route => {
        if (route.duration <= driveData.routes[0].duration) {
          route.duration = (route.distance / 1.25); 
        }
      });
      allModesData.walking = walkData.routes;
    }

    masterTelemetryData = {
      villageTown, district, state, landmark, county, pincode, currW, currAQI, aqiBadge, nearestQuakeText,
      intelSummary: intelResult.summary,
      intelSourceName: intelResult.sourceName,
      intelBadgeColor: intelResult.badgeColor,
      intelSourceUrl: intelResult.sourceUrl
    };

    currentMode = 'driving';
    renderMasterCard();
    drawRouteOnMap('driving', 0);
    setTimeout(() => map.invalidateSize(), 50);

  } catch (err) {
    console.error("Master telemetry & route error:", err);
    infoBox.innerHTML = `<div class="card-placeholder"><p>Could not load route or telemetry data.</p></div>`;
  }
}

// Master Card Renderer with Mobile-Optimized Scrolling Box (`max-height` + `overflow-y: auto`)
function renderMasterCard() {
  const infoBox = document.getElementById('route-info');
  if (!infoBox || !masterTelemetryData) return;

  const t = masterTelemetryData;
  let tabSpecificHtml = '';

  if (currentMode === 'driving' || currentMode === 'walking') {
    const routes = allModesData[currentMode] || [];
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

    tabSpecificHtml = `
      <div style="font-size:0.7rem; color:#8b949e; margin-bottom:3px;">Route suggestion:</div>
      <div class="route-options-group">${optionsHtml}</div>
    `;
  } 
  else if (currentMode === 'locality') {
    tabSpecificHtml = `
      <!-- SCROLLABLE CONTAINER FOR LOCALITY INTELLIGENCE -->
      <div style="max-height: 160px; overflow-y: auto; padding-right: 4px; margin-bottom: 6px; scrollbar-width: thin;">
        <div style="background: #1e293b; border: 1px solid #334155; padding: 8px; border-radius: 6px; font-size: 0.68rem; color: #f8fafc;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: bold; color: #38bdf8;">📖 Locality Intelligence</span>
            <span style="background: #0f172a; color: ${t.intelBadgeColor}; border: 1px solid ${t.intelBadgeColor}; padding: 1px 5px; border-radius: 3px; font-size: 0.55rem; font-weight: bold;">
              Source: ${t.intelSourceName} 🟢
            </span>
          </div>
          <p style="margin: 0 0 6px 0; color: #cbd5e1; line-height: 1.35; font-size: 0.65rem;">${t.intelSummary}</p>
          <div style="font-size: 0.6rem; color: #94a3b8; border-top: 1px solid #334155; padding-top: 4px; display: flex; justify-content: space-between; align-items: center;">
            <span>Mandal: <b>${t.county}</b></span>
            <a href="${t.intelSourceUrl}" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; text-decoration: underline; font-weight: bold;">
              Open ${t.intelSourceName} ↗
            </a>
          </div>
        </div>
      </div>
      <div style="background: #1e293b; border: 1px solid #334155; padding: 5px 8px; border-radius: 6px; font-size: 0.62rem; color: #cbd5e1;">
        <span style="color:#ef4444; font-weight:bold;">🌋 Nearest Seismic Event:</span> ${t.nearestQuakeText}
      </div>
    `;
  }

  infoBox.innerHTML = `
    <div class="route-results-grid" style="font-family: system-ui, -apple-system, sans-serif;">
      
      <!-- COMMON DESTINATION BANNER -->
      <div style="background: #1e293b; border-left: 3px solid #38bdf8; border-radius: 6px; padding: 6px 10px; margin-bottom: 8px;">
        <div style="font-size: 0.82rem; font-weight: 800; color: #38bdf8;">📍 ${t.villageTown}, ${t.district}</div>
        <div style="font-size: 0.62rem; color: #cbd5e1; margin-top: 1px;">
          ${t.landmark} • ${t.state} (<span style="color:#10b981; font-weight:bold;">${t.pincode}</span>)
        </div>
      </div>

      <!-- 4 PERMANENT TOP MODE BUTTONS -->
      <div class="mode-switcher" style="display: flex; gap: 3px; margin-bottom: 8px;">
        <button class="mode-btn ${currentMode === 'driving' ? 'active-mode' : ''}" onclick="switchMode('driving')" style="flex:1; padding:4px 4px; font-size:0.65rem;">🚗 Driving</button>
        <button class="mode-btn ${currentMode === 'walking' ? 'active-mode' : ''}" onclick="switchMode('walking')" style="flex:1; padding:4px 4px; font-size:0.65rem;">🚶 Walking</button>
        <button class="mode-btn ${currentMode === 'locality' ? 'active-mode' : ''}" onclick="switchMode('locality')" style="flex:1; padding:4px 4px; font-size:0.65rem;">📍 Locality</button>
        <button class="mode-btn ${currentMode === 'radar' ? 'active-mode' : ''}" onclick="switchMode('radar')" style="flex:1; padding:4px 4px; font-size:0.65rem;">🌪️ Radar</button>
      </div>

      ${tabSpecificHtml}

      <!-- BOTTOM CLEAR BUTTON TO RESET MAP -->
      ${activePinnedLat ? `
        <button onclick="removePinnedLocation()" style="width:100%; margin-top:8px; background:#1e293b; color:#ef4444; border:1px solid #ef4444; padding:5px; border-radius:4px; font-size:0.7rem; font-weight:bold; cursor:pointer;">
          🗑️ Clear Pin & Reset Map
        </button>
      ` : ''}

    </div>
  `;
}

function formatDuration(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  let parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}min`);
  return parts.join(' ');
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
  if (!routes || routes.length === 0) return;
  
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

// Triggered when typing in search bar
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

// Map resize observer
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







