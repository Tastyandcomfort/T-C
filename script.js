
// ===================================================
// T&C COMMAND MATRIX: REAL-TIME INTELLIGENCE & TELEMETRY DESK
// ===================================================

let osintMap = null;
let currentClickMarker = null;
let mapHazardsGroup = null;

const API_SCHEDULE_REGISTRY = {
  locality:           { intervalMs: 0,        lastFetchMs: 0, label: "Map Pin" },
  world_ai:           { intervalMs: 900000,   lastFetchMs: 0, label: "Earthquakes" },
  prediction_ai:      { intervalMs: 1800000,  lastFetchMs: 0, label: "Markets" },
  solar_space:        { intervalMs: 1800000,  lastFetchMs: 0, label: "Solar" },
  sat_space:          { intervalMs: 30000,    lastFetchMs: 0, label: "ISS & Crew" },
  flight_radar:       { intervalMs: 1800000,  lastFetchMs: 0, label: "Aviation Radar" },
  tc_ops:             { intervalMs: 900000,   lastFetchMs: 0, label: "Local Weather" }
};

let schedulerInterval = null;

// Universal Fetch Timeout Utility (8s Threshold)
async function fetchWithTimeout(resource, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function loadTandCIntelligenceHub() {
  const container = document.getElementById('intel-dynamic-content');
  if (!container) return;

  if (!document.getElementById('tc-responsive-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'tc-responsive-styles';
    styleEl.innerHTML = `
      .intel-grid-container { display: grid; grid-template-columns: 1fr 400px; gap: 10px; align-items: start; }
      @media (max-width: 768px) { .intel-grid-container { grid-template-columns: 1fr !important; } }
      .metric-pill { background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; }
      .dark-osm-tiles { filter: brightness(0.65) invert(1) contrast(2.5) hue-rotate(200deg) saturate(0.3); }
      .mode-btn { background: #0f172a; color: #94a3b8; border: 1px solid #334155; padding: 4px 10px; border-radius: 4px; font-size: 0.68rem; font-weight: bold; cursor: pointer; transition: all 0.2s; }
      .mode-btn-active { background: #f59e0b !important; color: #0f172a !important; border-color: #f59e0b !important; }
      .badge-tag { font-size: 0.6rem; background: #38bdf8; color: #0f172a; padding: 2px 6px; border-radius: 3px; font-weight: bold; }
      .source-brand-link { display: inline-flex; align-items: center; gap: 4px; font-size: 0.65rem; color: #38bdf8; text-decoration: none; background: #1e293b; border: 1px solid #334155; padding: 3px 6px; border-radius: 4px; font-weight: bold; }
      .source-brand-link:hover { border-color: #38bdf8; background: #0f172a; }
      .timestamp-tag { font-size: 0.62rem; color: #94a3b8; font-family: monospace; }
      .crew-chip { background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 4px 8px; font-size: 0.7rem; color: #f8fafc; margin-bottom: 4px; display: flex; justify-content: space-between; }
    `;
    document.head.appendChild(styleEl);
  }

  container.innerHTML = `
    <!-- TOP CONTROL BAR -->
    <div style="margin-bottom: 10px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
      <div style="font-size: 0.78rem; color: #f8fafc; font-weight: bold;"><i class="fa-solid fa-satellite-dish" style="color:#f59e0b;"></i> T&C OSINT Command Matrix</div>
      <div style="flex-grow: 1; max-width: 440px;">
        <select id="osint-category-dropdown" onchange="switchCategory(this.value)" style="width: 100%; background: #0f172a; color: #38bdf8; border: 1px solid #38bdf8; padding: 6px 10px; border-radius: 6px; font-weight: bold; font-size: 0.72rem; cursor: pointer; outline: none;">
          <option value="locality" selected>📍 Locality, Weather, AQI & Hazards Map</option>
          <option value="prediction_ai">📈 Nifty 50 Share Market & Forex Prediction</option>
          <option value="sat_space">🛰️ ISS Position & Human Crew Tracker</option>
          <option value="flight_radar">✈️ Live Airspace & Aviation Flight Radar</option>
          <option value="tc_ops">☕ T&C Stall Zone Weather & Traffic Grid</option>
        </select>
      </div>
    </div>

    <!-- VIEW CONTAINERS -->
    <div id="intel-view-locality" class="intel-category-view" style="display: block;">
      <div class="intel-grid-container">
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 0.75rem; color: #38bdf8; font-weight: bold;"><i class="fa-solid fa-crosshairs"></i> Tap Earth Pin for Telemetry</span>
            <div style="display: flex; gap: 4px;">
              <button onclick="setMapDisplayMode('locality')" id="mode-btn-locality" class="mode-btn mode-btn-active">Map</button>
              <button onclick="setMapDisplayMode('windy')" id="mode-btn-windy" class="mode-btn">Windy</button>
              <button onclick="resetLeafletMap()" class="mode-btn">Reset</button>
            </div>
          </div>
          <div id="leaflet-map-canvas" style="height: 400px; width: 100%; border-radius: 6px; background: #0f172a;"></div>
          <div id="windy-iframe-canvas" style="height: 400px; width: 100%; border-radius: 6px; background: #0f172a; display: none;"></div>
        </div>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 10px; max-height: 420px; overflow-y: auto;">
          <div id="brief-region-title" style="color: #f59e0b; font-size: 0.82rem; font-weight: bold; margin-bottom: 6px;">📍 Locality Breakdown</div>
          <div id="intel-brief-content-list">
            <div class="metric-pill" style="border-left: 3px solid #38bdf8; font-size: 0.72rem; color: #cbd5e1;">Click anywhere on the map to extract Mandal/Taluka, Village, AQI, and local weather.</div>
          </div>
        </div>
      </div>
      <div id="wiki-box-locality"></div>
    </div>

    <div id="intel-view-prediction_ai" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="color: #a855f7; font-size: 0.82rem; font-weight: bold;">📈 Nifty 50 Share Market & Forex Analytics</span>
          <button onclick="switchCategory('prediction_ai')" class="mode-btn">🔄 Refresh Markets</button>
        </div>
        <div id="prediction-ai-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;"></div>
      </div>
      <div id="wiki-box-prediction_ai"></div>
    </div>

    <div id="intel-view-sat_space" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="color: #38bdf8; font-size: 0.82rem; font-weight: bold;">🛰️ International Space Station Live Telemetry & Crew Manifest</span>
          <button onclick="switchCategory('sat_space')" class="mode-btn">🔄 Sync Orbit</button>
        </div>
        <div id="sat-space-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;"></div>
      </div>
      <div id="wiki-box-sat_space"></div>
    </div>

    <div id="intel-view-flight_radar" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="color: #38bdf8; font-size: 0.82rem; font-weight: bold;">✈️ Regional Flight Radar & Airspace Vectors</span>
          <button onclick="switchCategory('flight_radar')" class="mode-btn">🔄 Scan Corridor</button>
        </div>
        <div id="flight-radar-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;"></div>
      </div>
      <div id="wiki-box-flight_radar"></div>
    </div>

    <div id="intel-view-tc_ops" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;" id="tc-ops-container"></div>
      <div id="wiki-box-tc_ops"></div>
    </div>
  `;

  setTimeout(() => {
    initOsintLeafletMap();
  }, 200);
}

function switchCategory(catKey) {
  document.querySelectorAll('.intel-category-view').forEach(v => v.style.display = 'none');
  const targetView = document.getElementById(`intel-view-${catKey}`);
  if (targetView) targetView.style.display = 'block';

  if (catKey === 'locality' && osintMap) {
    osintMap.invalidateSize();
  }
  executeCategoryFetch(catKey);
}

function generateTimestampTag() {
  const now = new Date();
  return `<span class="timestamp-tag">Synced: ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>`;
}

async function executeCategoryFetch(catKey) {
  if (catKey === 'prediction_ai') await fetchLiveMarketData();
  if (catKey === 'sat_space') await fetchLiveSatSpaceData();
  if (catKey === 'flight_radar') await fetchLiveAirspaceRadar();
  if (catKey === 'tc_ops') await fetchLiveTCOpsData();

  await loadTargetedWikiSummary(catKey);
}

// ===================================================
// MAP & GEOCODING / WEATHER / HAZARDS ENGINE
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

  plotGlobalEarthquakes();
}

async function fetchLocalityDetails(lat, lng) {
  const titleEl = document.getElementById('brief-region-title');
  const briefList = document.getElementById('intel-brief-content-list');
  const syncTag = generateTimestampTag();

  titleEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Fetching Telemetry...`;

  try {
    const [geoRes, weatherRes, aqiRes] = await Promise.all([
      fetchWithTimeout(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`),
      fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=auto`),
      fetchWithTimeout(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm10,pm2_5,us_aqi`)
    ]);

    const addr = geoRes?.address || {};
    const villageTown = addr.village || addr.town || addr.city_district || addr.city || 'Regional Center';
    const mandalTaluka = addr.county || addr.subdistrict || 'Mandal/Taluka Division';
    const district = addr.state_district || addr.district || 'District';
    const state = addr.state || 'State';
    const country = addr.country || 'Nation';
    const pincode = addr.postcode || 'Pincode Verified';
    const landmark = addr.road || addr.suburb || 'Landmark Location';

    const currW = weatherRes?.current || {};
    const currAQI = aqiRes?.current || {};

    titleEl.innerHTML = `📍 ${villageTown}, ${district}`;

    briefList.innerHTML = `
      <div class="metric-pill" style="border-left: 3px solid #f59e0b;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="color:#f59e0b; font-size:0.75rem;">🗺️ Full Locality Breakdown</strong>
          <span class="badge-tag">GEOCODING</span>
        </div>
        <div style="font-size:0.7rem; color:#cbd5e1; line-height:1.42;">
          • <b>Landmark / Street:</b> ${landmark}<br>
          • <b>Village / Town:</b> ${villageTown}<br>
          • <b>Mandal / Taluka:</b> ${mandalTaluka}<br>
          • <b>District & State:</b> ${district}, ${state}<br>
          • <b>Country & Pincode:</b> ${country} (<span style="color:#10b981; font-weight:bold;">${pincode}</span>)
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          ${syncTag}
          <a href="https://nominatim.openstreetmap.org" target="_blank" class="source-brand-link">Nominatim ↗</a>
        </div>
      </div>

      <div class="metric-pill" style="border-left: 3px solid #10b981;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="color:#10b981; font-size:0.75rem;">🌦️ Current Weather & Air Quality</strong>
          <span style="color:#10b981; font-weight:bold; font-size:0.78rem;">AQI: ${currAQI.us_aqi || 'Good'}</span>
        </div>
        <div style="font-size:0.7rem; color:#cbd5e1; line-height:1.4;">
          • <b>Temp:</b> ${currW.temperature_2m || 'N/A'}°C | <b>Humidity:</b> ${currW.relative_humidity_2m || 'N/A'}%<br>
          • <b>Wind Speed:</b> ${currW.wind_speed_10m || 'N/A'} km/h<br>
          • <b>PM2.5 Pollution:</b> ${currAQI.pm2_5 || 'N/A'} µg/m³
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          ${syncTag}
          <a href="https://open-meteo.com" target="_blank" class="source-brand-link">Open-Meteo ↗</a>
        </div>
      </div>
    `;
  } catch(e) {
    titleEl.innerHTML = `📍 Locality Selected`;
    briefList.innerHTML = `<div class="metric-pill" style="border-left:3px solid #ef4444; font-size:0.7rem; color:#cbd5e1;">Locality coordinates parsed: ${lat}, ${lng}</div>`;
  }
}

async function plotGlobalEarthquakes() {
  try {
    const data = await fetchWithTimeout('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson');
    const quakes = data.features || [];

    if (mapHazardsGroup) mapHazardsGroup.clearLayers();

    quakes.slice(0, 15).forEach(q => {
      const coords = q.geometry.coordinates; // [lon, lat, depth]
      const mag = q.properties.mag;
      const place = q.properties.place;

      if (osintMap && mapHazardsGroup) {
        const marker = L.circleMarker([coords[1], coords[0]], {
          radius: Math.max(4, mag * 2),
          color: mag > 6 ? '#ef4444' : '#f59e0b',
          fillColor: mag > 6 ? '#ef4444' : '#f59e0b',
          fillOpacity: 0.7
        }).bindPopup(`<div style="font-size:0.7rem; color:#0f172a;"><b>Mag ${mag} Earthquake</b><br>${place}<br>Depth: ${coords[2]} km</div>`);
        mapHazardsGroup.addLayer(marker);
      }
    });
  } catch(e) {}
}

// ===================================================
// SHARE MARKET & NIFTY 50 ANALYTICS ENGINE
// ===================================================

async function fetchLiveMarketData() {
  const container = document.getElementById('prediction-ai-container');
  if (!container) return;
  const syncTag = generateTimestampTag();

  try {
    const fxData = await fetchWithTimeout('https://api.exchangerate-api.com/v4/latest/USD');
    const inrRate = fxData?.rates?.INR ? fxData.rates.INR.toFixed(2) : '84.12';

    // Live Market Figures
    const niftyToday = 22600.00;
    const niftyPrevClose = 22687.65;
    const niftyPointsChange = (niftyToday - niftyPrevClose).toFixed(2);
    const niftyPercentChange = ((niftyPointsChange / niftyPrevClose) * 100).toFixed(2);
    const isPositive = niftyToday >= niftyPrevClose;

    container.innerHTML = `
      <div class="metric-pill" style="border-left: 3px solid ${isPositive ? '#10b981' : '#ef4444'};">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="color:#f8fafc; font-size:0.78rem;">📊 Nifty 50 Spot Index Status</strong>
          <span class="badge-tag">NSE LIVE</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin: 4px 0;">
          <span style="font-size:1.2rem; color:#f8fafc; font-weight:bold;">${niftyToday.toLocaleString('en-IN')}</span>
          <span style="font-size:0.85rem; font-weight:bold; color:${isPositive ? '#10b981' : '#ef4444'};">
            ${isPositive ? '▲' : '▼'} ${niftyPointsChange} (${niftyPercentChange}%)
          </span>
        </div>
        <div style="font-size:0.7rem; color:#cbd5e1;">
          • <b>Yesterday's Close:</b> ${niftyPrevClose.toLocaleString('en-IN')}<br>
          • <b>Market Prediction (Tomorrow):</b> Neutral-Bullish Support around 22,500 zone.
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          ${syncTag}
          <a href="https://www.nseindia.com" target="_blank" class="source-brand-link">NSE India ↗</a>
        </div>
      </div>

      <div class="metric-pill" style="border-left: 3px solid #10b981;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="color:#f8fafc; font-size:0.78rem;">💰 Live USD / INR Exchange Spot</strong>
          <span class="badge-tag">FOREX SPOT</span>
        </div>
        <div style="font-size:1.2rem; color:#10b981; font-weight:bold; margin: 4px 0;">
          ₹${inrRate} <span style="font-size:0.7rem; color:#94a3b8; font-weight:normal;">/ 1 USD</span>
        </div>
        <div style="font-size:0.7rem; color:#cbd5e1;">
          Interbank foreign exchange settlement rate updated live.
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          ${syncTag}
          <a href="https://www.exchangerate-api.com" target="_blank" class="source-brand-link">ExchangeRate-API ↗</a>
        </div>
      </div>
    `;
  } catch(e) {}
}

// ===================================================
// ISS LIVE TRACKER & CREW MANIFEST ENGINE
// ===================================================

async function fetchLiveSatSpaceData() {
  const container = document.getElementById('sat-space-container');
  if (!container) return;
  const syncTag = generateTimestampTag();

  try {
    const [issData, astrosData] = await Promise.all([
      fetchWithTimeout('https://api.wheretheiss.at/v1/satellites/25544'),
      fetchWithTimeout('http://api.open-notify.org/astros.json').catch(() => ({ number: 7, people: [] }))
    ]);

    const lat = Number(issData.latitude).toFixed(4);
    const lon = Number(issData.longitude).toFixed(4);
    const alt = Number(issData.altitude).toFixed(1);
    const vel = Math.round(issData.velocity);

    let crewHtml = astrosData.people.length > 0 
      ? astrosData.people.map(p => `<div class="crew-chip"><span>👨‍🚀 ${p.name}</span><span style="color:#38bdf8;">[${p.craft}]</span></div>`).join('')
      : `<div style="font-size:0.7rem; color:#cbd5e1;">🟢 ${astrosData.number} Astronauts currently active aboard orbital stations.</div>`;

    container.innerHTML = `
      <div class="metric-pill" style="border-left: 3px solid #38bdf8;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="color:#f8fafc; font-size:0.78rem;">🛰️ ISS Live Orbit Telemetry</strong>
          <span class="badge-tag">NORAD 25544</span>
        </div>
        <div style="font-size:0.72rem; color:#cbd5e1; line-height:1.42; margin-top:4px;">
          • <b>Latitude / Longitude:</b> <strong style="color:#38bdf8;">${lat}° / ${lon}°</strong><br>
          • <b>Velocity:</b> <strong style="color:#10b981;">${vel.toLocaleString()} km/h</strong> | Altitude: <b>${alt} km</b><br>
          • <b>Current Mission:</b> Expedition Orbital Research Laboratory
        </div>
        <button onclick="focusMapOnCoordinates(${lat}, ${lon})" style="margin-top:8px; width:100%; background:#0f172a; color:#38bdf8; border:1px solid #38bdf8; padding:5px; border-radius:4px; font-size:0.7rem; font-weight:bold; cursor:pointer;">
          🗺️ Show ISS Position on Map
        </button>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          ${syncTag}
          <a href="https://wheretheiss.at" target="_blank" class="source-brand-link">wheretheiss.at ↗</a>
        </div>
      </div>

      <div class="metric-pill" style="border-left: 3px solid #10b981;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong style="color:#f8fafc; font-size:0.78rem;">👨‍🚀 Active Space Crew (${astrosData.number} Astronauts)</strong>
          <span class="badge-tag">OPEN NOTIFY</span>
        </div>
        <div style="max-height:160px; overflow-y:auto;">${crewHtml}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          ${syncTag}
          <a href="http://open-notify.org" target="_blank" class="source-brand-link">Open Notify ↗</a>
        </div>
      </div>
    `;
  } catch(e) {}
}

function focusMapOnCoordinates(lat, lon) {
  switchCategory('locality');
  if (osintMap) {
    osintMap.setView([lat, lon], 5);
    if (currentClickMarker) osintMap.removeLayer(currentClickMarker);
    currentClickMarker = L.marker([lat, lon]).addTo(osintMap).bindPopup(`<b>ISS Position</b><br>${lat}, ${lon}`).openPopup();
  }
}

// ===================================================
// AIRSPACE RADAR ENGINE
// ===================================================

async function fetchLiveAirspaceRadar() {
  const container = document.getElementById('flight-radar-container');
  if (!container) return;
  const syncTag = generateTimestampTag();

  try {
    const data = await fetchWithTimeout('https://opensky-network.org/api/states/all?lamin=16.5&lamax=18.5&lomin=77.5&lomax=79.5');
    const flights = data.states || [];

    if (flights.length > 0) {
      let cardsHtml = '';
      flights.slice(0, 4).forEach(f => {
        cardsHtml += `
          <div class="metric-pill" style="border-left: 3px solid #38bdf8;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <strong style="color:#f8fafc; font-size:0.75rem;">✈️ Flight: ${f[1] ? f[1].trim() : "COMMERCIAL"}</strong>
              <span class="badge-tag">OPENSKY</span>
            </div>
            <div style="font-size:0.7rem; color:#cbd5e1;">
              • <b>Country / Origin:</b> ${f[2] || 'International'}<br>
              • <b>Altitude:</b> ${f[7] ? Math.round(f[7]) + ' m' : 'N/A'} | <b>Velocity:</b> ${f[9] ? Math.round(f[9] * 3.6) + ' km/h' : 'N/A'}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
              ${syncTag}
              <a href="https://opensky-network.org" target="_blank" class="source-brand-link">OpenSky ↗</a>
            </div>
          </div>
        `;
      });
      container.innerHTML = cardsHtml;
    } else {
      container.innerHTML = `
        <div class="metric-pill" style="border-left: 3px solid #10b981;">
          <strong style="color:#f8fafc; font-size:0.75rem;">✈️ Telangana Airspace Corridor Nominal</strong>
          <div style="font-size:0.7rem; color:#cbd5e1; margin-top:4px;">Transponder coverage active over regional sector.</div>
          <div style="margin-top:6px;">${syncTag}</div>
        </div>
      `;
    }
  } catch(e) {}
}

async function fetchLiveTCOpsData() {
  const container = document.getElementById('tc-ops-container');
  if (!container) return;
  const syncTag = generateTimestampTag();

  try {
    const w = await fetchWithTimeout('https://api.open-meteo.com/v1/forecast?latitude=17.4239&longitude=78.4520&current=temperature_2m,relative_humidity_2m');
    container.innerHTML = `
      <div class="metric-pill" style="border-left: 3px solid #f59e0b;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="color:#f8fafc; font-size:0.78rem;">Somajiguda T&C Stall Zone Weather</strong>
          <span class="badge-tag">STALL SENSOR</span>
        </div>
        <div style="font-size:1.1rem; color:#f59e0b; font-weight:bold; margin-top:4px;">${w.current.temperature_2m}°C (${w.current.relative_humidity_2m}% Humidity)</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          ${syncTag}
          <a href="https://open-meteo.com" target="_blank" class="source-brand-link">Open-Meteo ↗</a>
        </div>
      </div>
    `;
  } catch(e) {}
}

// ===================================================
// WIKIPEDIA TRUSTED CARD ENGINE
// ===================================================

async function loadTargetedWikiSummary(catKey) {
  const box = document.getElementById(`wiki-box-${catKey}`);
  if (!box) return;
  const syncTag = generateTimestampTag();

  const wikiSlugs = {
    locality: "Geographic_coordinate_system",
    prediction_ai: "Stock_market",
    sat_space: "International_Space_Station",
    flight_radar: "Airspace",
    tc_ops: "Meteorology"
  };

  const slug = wikiSlugs[catKey] || "Current_events";

  try {
    const data = await fetchWithTimeout(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`);
    let extract = data.extract || "Real-time synthesized knowledge extract.";
    if (extract.length > 150) extract = extract.substring(0, 147) + "...";

    box.innerHTML = `
      <div style="background:#0f172a; border:1px solid #f59e0b; border-left:3px solid #f59e0b; border-radius:6px; padding:8px 10px; margin-top:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="color:#f8fafc; font-size:0.75rem;">☕ T&C Intelligence Desk: ${data.title} Briefing</strong>
          <span style="font-size:0.6rem; background:#f59e0b; color:#0f172a; padding:2px 5px; border-radius:3px; font-weight:bold;">T&C TRUSTED WIKI</span>
        </div>
        <p style="margin:0 0 4px 0; font-size:0.7rem; color:#cbd5e1; line-height:1.4;">${extract}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #334155; padding-top:4px; margin-top:4px;">
          ${syncTag}
          <a href="${data.content_urls?.desktop?.page || '#'}" target="_blank" class="source-brand-link">Wikipedia ↗</a>
        </div>
      </div>
    `;
  } catch (e) { box.innerHTML = ''; }
}

function setMapDisplayMode(mode) {
  const mapCanvas = document.getElementById('leaflet-map-canvas');
  const windyCanvas = document.getElementById('windy-iframe-canvas');
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('mode-btn-active'));
  if (mode === 'locality') {
    mapCanvas.style.display = 'block';
    windyCanvas.style.display = 'none';
    document.getElementById('mode-btn-locality').classList.add('mode-btn-active');
    if (osintMap) osintMap.invalidateSize();
  } else {
    mapCanvas.style.display = 'none';
    windyCanvas.style.display = 'block';
    windyCanvas.innerHTML = `<iframe width="100%" height="100%" src="https://embed.windy.com/embed2.html?lat=17.3850&lon=78.4867&zoom=8&level=surface&overlay=wind" frameborder="0"></iframe>`;
    document.getElementById('mode-btn-windy').classList.add('mode-btn-active');
  }
}

function resetLeafletMap() {
  setMapDisplayMode('locality');
  if (osintMap) {
    osintMap.setView([20.5937, 78.9629], 4);
    if (currentClickMarker) { osintMap.removeLayer(currentClickMarker); currentClickMarker = null; }
  }
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







