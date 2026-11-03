// ===================================================
// T&C "YOU ARE HERE MAP" & TELEMETRY MODULE
// ===================================================

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
let telemetryMarker = null;
let activePinnedLat = null;
let activePinnedLng = null;
let pendingLat = null;
let pendingLng = null;
let masterTelemetryData = null;

// Global map reference
let map = null;
let seismicLayerGroup = null;

// AQI Badge Helper
function getAQIShortBadge(aqiVal) {
  if (aqiVal === undefined || aqiVal === null || isNaN(aqiVal)) return { text: 'AQI N/A', color: '#94a3b8' };
  if (aqiVal <= 50) return { text: `🟢 AQI ${aqiVal} (Good)`, color: '#34c759' };
  if (aqiVal <= 100) return { text: `🟡 AQI ${aqiVal} (Mod)`, color: '#ffcc00' };
  if (aqiVal <= 150) return { text: `🟠 AQI ${aqiVal} (Sens)`, color: '#ff9500' };
  return { text: `🔴 AQI ${aqiVal} (Poor)`, color: '#ff3b30' };
}

// RESET MAP & CLEAR SELECTION
function removePinnedLocation() {
  if (telemetryMarker && map) {
    map.removeLayer(telemetryMarker);
    telemetryMarker = null;
  }
  if (destMarker && map) {
    map.removeLayer(destMarker);
    destMarker = null;
  }
  if (map) {
    routeLayers.forEach(layer => map.removeLayer(layer));
  }
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
        <span class="pulse-icon">📍</span>
        <p>Search a destination or tap an amenity tile above.</p>
      </div>
    `;
  }
  setTimeout(() => { if (map) map.invalidateSize(); }, 50);
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

  windyOverlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; z-index:999; background:#0f172a; border-radius:16px; display:flex; flex-direction:column; overflow:hidden;';

  windyOverlay.innerHTML = `
    <div onclick="event.stopPropagation()" onmousedown="event.stopPropagation()" style="background:#1c1c24; border-bottom:0.5px solid rgba(255,255,255,0.12); padding:8px 12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; flex-shrink:0; z-index:1000;">
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:0.75rem; color:#ffd700; font-weight:bold;">🌪️ Live Radar</span>
        <span style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-size:0.65rem;">🌡️ ${currW.temperature_2m !== undefined ? currW.temperature_2m + '°C' : 'N/A'}</span>
        <span style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-size:0.65rem;">💨 ${currW.wind_speed_10m !== undefined ? currW.wind_speed_10m + ' km/h' : 'N/A'}</span>
      </div>
      <button onclick="switchMode('driving')" style="background:#ff3b30; color:#fff; border:none; padding:4px 10px; border-radius:9999px; font-size:0.7rem; font-weight:700; cursor:pointer;">
        ✕ Close
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
    setTimeout(() => { if (map) map.invalidateSize(); }, 50);
  }
}

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

  setTimeout(() => { if (map) map.invalidateSize(); }, 50);
}

// Apple Styled Confirmation Modal
function showConfirmModal(lat, lng) {
  const mapDiv = document.getElementById('map');
  if (!mapDiv) return;

  let modal = document.getElementById('confirm-pin-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'confirm-pin-modal';
    mapDiv.appendChild(modal);
  }

  modal.style.cssText = 'position:absolute; bottom:16px; left:50%; transform:translateX(-50%); width:90%; max-width:320px; z-index:2000; background:rgba(30,30,36,0.92); backdrop-filter:blur(20px); border:0.5px solid rgba(255,255,255,0.18); border-radius:18px; padding:14px; box-shadow:0 12px 32px rgba(0,0,0,0.8); text-align:center; color:#fff; font-family:-apple-system, sans-serif;';

  modal.innerHTML = `
    <div style="font-size:0.85rem; font-weight:700; color:#ffd700; margin-bottom:4px;">Update Target Location?</div>
    <div style="font-size:0.72rem; color:#86868b; margin-bottom:12px;">Coordinates: <b>${lat}, ${lng}</b></div>
    <div style="display:flex; gap:8px;">
      <button id="btn-confirm-yes" style="flex:1; background:#34c759; color:#000; border:none; padding:8px; border-radius:9999px; font-size:0.75rem; font-weight:700; cursor:pointer;">Update</button>
      <button id="btn-confirm-no" style="flex:1; background:rgba(255,255,255,0.1); color:#fff; border:none; padding:8px; border-radius:9999px; font-size:0.75rem; font-weight:600; cursor:pointer;">Cancel</button>
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
  if (modal) modal.remove();
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
      if (!geoRes.ok) throw new Error("Search service unavailable.");
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
                badgeColor: "#34c759",
                sourceUrl: summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(matchedTitle)}`
              };
            }
          }
        }
      }
    } catch (err) {}
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  return {
    summary: `Verified sector overview for <b>${villageTown}</b> (${district}). Located near ${landmark}, pin code <b>${pincode}</b>, ${state}.`,
    sourceName: "Google Maps",
    badgeColor: "#007aff",
    sourceUrl: googleMapsUrl
  };
}

async function fetchLocationDataAndRoutes(lat, lng, displayName = null) {
  const infoBox = document.getElementById('route-info');
  if (infoBox) {
    infoBox.innerHTML = `
      <div class="card-placeholder">
        <span class="pulse-icon">⏳</span>
        <p>Calculating routes &amp; local telemetry...</p>
      </div>
    `;
  }

  if (telemetryMarker && map) map.removeLayer(telemetryMarker);
  if (map) {
    telemetryMarker = L.marker([lat, lng]).addTo(map)
      .bindPopup(`<b>Destination</b><br>${lat}, ${lng}`).openPopup();
  }

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

    let nearestQuakeText = "No active quakes recorded nearby";
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
    setTimeout(() => { if (map) map.invalidateSize(); }, 50);

  } catch (err) {
    if (infoBox) infoBox.innerHTML = `<div><p>Unable to retrieve route data.</p></div>`;
  }
}

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
      const label = index === 0 ? "Shortest Route" : `Alternative ${index + 1}`;
      
      optionsHtml += `
        <button class="route-option-btn ${index === 0 ? 'active-route' : ''}" onclick="switchRouteIndex(${index}, this)">
          <div style="font-weight:700; color:#ffd700;">${label}</div>
          <div style="font-size:0.75rem; color:#ccc;">${dist} km • ~${timeFormatted}</div>
        </button>
      `;
    });

    tabSpecificHtml = `
      <div style="display:flex; gap:8px; margin-top:8px;">${optionsHtml}</div>
    `;
  } 
  else if (currentMode === 'locality') {
    tabSpecificHtml = `
      <div style="background: rgba(255,255,255,0.03); border: 0.5px solid var(--apple-border); padding: 10px; border-radius: 12px; font-size: 0.72rem; color: #fff; margin-top:6px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-weight: bold; color: #ffd700;">Sector Intelligence</span>
          <span style="color: ${t.intelBadgeColor}; font-weight: bold;">${t.intelSourceName}</span>
        </div>
        <p style="margin: 0 0 6px 0; color: #bbb; line-height: 1.4;">${t.intelSummary}</p>
        <div style="font-size: 0.68rem; color: #888; display: flex; justify-content: space-between;">
          <span>Mandal: <b>${t.county}</b></span>
          <a href="${t.intelSourceUrl}" target="_blank" style="color: #007aff; text-decoration: underline;">Open Source ↗</a>
        </div>
      </div>
      <div style="background: rgba(255,255,255,0.03); border: 0.5px solid var(--apple-border); padding: 8px 10px; border-radius: 10px; font-size: 0.7rem; color: #ccc; margin-top: 6px;">
        <span style="color:#ff3b30; font-weight:bold;">🌋 Nearest Seismic:</span> ${t.nearestQuakeText}
      </div>
    `;
  }

  infoBox.innerHTML = `
    <div>
      <div style="background: rgba(255, 255, 255, 0.04); border-left: 3px solid #ffd700; border-radius: 10px; padding: 8px 12px; margin-bottom: 8px;">
        <div style="font-size: 0.88rem; font-weight: 800; color: #fff;">📍 ${t.villageTown}, ${t.district}</div>
        <div style="font-size: 0.7rem; color: #86868b;">
          ${t.landmark} • ${t.state} (<span style="color:#34c759; font-weight:bold;">${t.pincode}</span>)
        </div>
      </div>

      <div class="apple-segmented-scroll" style="margin-bottom: 8px;">
        <button class="${currentMode === 'driving' ? 'active-mode' : ''}" onclick="switchMode('driving')">🚗 Driving</button>
        <button class="${currentMode === 'walking' ? 'active-mode' : ''}" onclick="switchMode('walking')">🚶 Walking</button>
        <button class="${currentMode === 'locality' ? 'active-mode' : ''}" onclick="switchMode('locality')">📍 Locality</button>
        <button class="${currentMode === 'radar' ? 'active-mode' : ''}" onclick="switchMode('radar')">🌪️ Radar</button>
      </div>

      ${tabSpecificHtml}

      ${activePinnedLat ? `
        <button onclick="removePinnedLocation()" style="width:100%; margin-top:10px; background:rgba(255,59,48,0.1); color:#ff3b30; border:0.5px solid #ff3b30; padding:6px; border-radius:9999px; font-size:0.75rem; font-weight:700; cursor:pointer;">
          Clear Pin &amp; Reset Map
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
  if (!map) return;
  routeLayers.forEach(layer => map.removeLayer(layer));
  routeLayers = [];

  const routes = allModesData[mode];
  if (!routes || routes.length === 0) return;
  
  routes.forEach((r, i) => {
    const color = i === index ? (mode === 'driving' ? '#ffd700' : '#34c759') : '#666';
    const weight = i === index ? 5 : 3;
    const opacity = i === index ? 0.9 : 0.4;

    const layer = L.geoJSON(r.geometry, {
      style: { color: color, weight: weight, opacity: opacity }
    }).addTo(map);

    routeLayers.push(layer);
  });

  if (routeLayers[index]) {
    map.fitBounds(routeLayers[index].getBounds(), { padding: [40, 40] });
  }
}

async function searchDestination() {
  const inputEl = document.getElementById('destination-input');
  if (!inputEl) return;
  const query = inputEl.value.trim();
  if (!query) {
    alert("Please enter a destination or landmark!");
    return;
  }
  await fetchRouteData(query);
}

async function searchAmenity(amenityKey) {
  const facility = customAmenities[amenityKey];
  if (!facility) return;

  const inputEl = document.getElementById('destination-input');
  if (inputEl) inputEl.value = facility.name;

  if (activePinnedLat !== null && activePinnedLng !== null) {
    const coords = facility.query.split(',').map(s => parseFloat(s.trim()));
    pendingLat = coords[0].toFixed(4);
    pendingLng = coords[1].toFixed(4);
    showConfirmModal(pendingLat, pendingLng);
    return;
  }

  await fetchRouteData(facility.query, facility.name);
}

async function loadLiveUSGSEarthquakes() {
  if (!map || !seismicLayerGroup) return;
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
        color: mag > 6 ? '#ff3b30' : '#ff9500',
        fillColor: mag > 6 ? '#ff3b30' : '#ff9500',
        fillOpacity: 0.75
      }).bindPopup(`
        <div style="font-size:0.75rem; color:#000;">
          <b>🌋 Mag ${mag} Earthquake</b><br>${place}
        </div>
      `).addTo(seismicLayerGroup);
    });
  } catch (err) {}
}

// ===================================================
// VIEW ROUTER ENGINE
// ===================================================
function switchView(viewId, element) {
  const sections = document.querySelectorAll('.app-section');
  sections.forEach(sec => sec.classList.remove('active-view'));
  
  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.add('active-view');

  document.querySelectorAll('.side-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  if (element) element.classList.add('active');

  if (viewId === 'map-view' && map) {
    setTimeout(() => map.invalidateSize(), 150);
  }
}

function showService(title, description) {
  const placeholder = document.getElementById('monitor-placeholder');
  if (placeholder) placeholder.classList.add('hidden');
  
  const dataBlock = document.getElementById('monitor-data');
  if (dataBlock) dataBlock.classList.remove('hidden');
  
  const titleEl = document.getElementById('monitor-title');
  if (titleEl) titleEl.innerText = title;

  const descEl = document.getElementById('monitor-desc');
  if (descEl) descEl.innerText = description;
}

function toggleUpi() {
  const upiFrame = document.getElementById('upi-display');
  if (upiFrame) upiFrame.classList.toggle('hidden');
}

// Gemini AI Chat
function handleChatKey(event) {
  if (event.key === 'Enter') submitUserMessage();
}

function sendChipPrompt(text) {
  const inputEl = document.getElementById('user-chat-input');
  if (inputEl) inputEl.value = text;
  submitUserMessage();
}

async function submitUserMessage() {
  const txtBox = document.getElementById('user-chat-input');
  if (!txtBox) return;
  const rawMsg = txtBox.value.trim();
  if (!rawMsg) return;

  const logBox = document.getElementById('chat-log-box');
  if (!logBox) return;
  
  logBox.innerHTML += `<div class="msg-bubble user-msg">${rawMsg}</div>`;
  txtBox.value = "";
  logBox.scrollTop = logBox.scrollHeight;

  const typingId = "ai-typing-" + Date.now();
  logBox.innerHTML += `<div class="msg-bubble bot-msg" id="${typingId}"><i>Thinking...</i></div>`;
  logBox.scrollTop = logBox.scrollHeight;

  const typingBubble = document.getElementById(typingId);

  try {
    const API_KEY = "AQ.Ab8RN6JbLJ8a8xNiL1Vq_msT-p8pg-nJHR6KpgfyU5vYol4Ihw"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const systemContext = `You are the friendly AI Concierge for "Tasty & Comfort" (T&C) at New Modern Mission.
    Details: Hours 8:00 AM - 10:00 PM. Premium Tea (₹10), French Fries (₹50/₹60/₹70), Sandwiches (₹45), Samosas (₹15/₹25), Rolls, Puffs, Noodles.
    Owner is Murali Manohar Nidadavolu. Keep replies short, helpful, and polite.`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: `${systemContext}\n\nUser: ${rawMsg}` }] }] })
    });

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;
    if (typingBubble) typingBubble.innerText = reply;
  } catch (err) {
    let fallback = "Welcome to T&C! How may I assist you with our tea, fresh fries, or location?";
    const lower = rawMsg.toLowerCase();
    if (lower.includes('hour') || lower.includes('time')) fallback = "We are open daily from 8:00 AM to 10:00 PM!";
    else if (lower.includes('price') || lower.includes('menu')) fallback = "Tea is ₹10, French Fries start at ₹50, and Samosas are ₹15. Check our Menu tab for all items!";
    else if (lower.includes('owner') || lower.includes('founder')) fallback = "The founder and owner of Tasty & Comfort is Murali Manohar Nidadavolu.";
    
    if (typingBubble) typingBubble.innerText = fallback;
  }
  logBox.scrollTop = logBox.scrollHeight;
}

// Announcements & Modals
let announcementActive = false;
let messageContent = "";

function checkAnnouncement() {
  fetch('announcement.json?t=' + Date.now())
    .then(r => r.json())
    .then(data => {
      const modal = document.getElementById('announcement-modal');
      const sound = document.getElementById('announcement-sound');
      
      if (data.status === 'active') {
        announcementActive = true;
        messageContent = data.message;
        if (modal && modal.classList.contains('hidden')) {
          const textEl = document.getElementById('announcement-text');
          if (textEl) textEl.innerText = messageContent;
          modal.classList.remove('hidden');
          if (sound) sound.play().catch(() => {});
        }
      } else if (modal) {
        announcementActive = false;
        modal.classList.add('hidden');
      }
    })
    .catch(() => {});
}

function closeAnnouncement() {
  const modal = document.getElementById('announcement-modal');
  if (modal) modal.classList.add('hidden');
}

function openMenuModal(imgSrc, title, price, type) {
  const modal = document.getElementById('menuModal');
  if (!modal) return;
  
  const imgEl = modal.querySelector('img');
  const h3El = modal.querySelector('h3');
  const priceEl = modal.querySelector('.price-tile');
  const typeEl = modal.querySelector('.type-tile');

  if (imgEl) imgEl.src = imgSrc;
  if (h3El) h3El.innerText = title;
  if (priceEl) priceEl.innerText = 'Price: ' + price;
  if (typeEl) typeEl.innerText = 'Category: ' + type;
  
  modal.showModal();
}

// News Feed
let currentScope = 'local';
let selectedNewsDate = new Date().toISOString().split('T')[0];

function switchNewsScope(scope) {
  currentScope = scope;
  fetchNews();
}

async function fetchNews() {
  const container = document.getElementById('news-container');
  if (!container) return;

  container.innerHTML = `<div style="color:#ffd700; font-size:0.8rem;"><i class="fa-solid fa-spinner fa-spin"></i> Loading live dispatch...</div>`;

  try {
    const res = await fetch(`https://news-lemon-two.vercel.app/api/news?scope=${currentScope}`);
    const xmlText = await res.text();
    const xml = new DOMParser().parseFromString(xmlText, "text/xml");
    const items = xml.querySelectorAll("item");

    if (!items || items.length === 0) throw new Error("No feed");

    let html = '';
    Array.from(items).slice(0, 8).forEach(item => {
      const title = item.querySelector("title")?.textContent || "Headline";
      const link = item.querySelector("link")?.textContent || "#";
      html += `
        <div class="news-item">
          <a href="${link}" target="_blank" rel="noopener" style="color:#fff; text-decoration:none; font-size:0.82rem; font-weight:500;">
            ${title}
          </a>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div style="font-size:0.75rem; color:#86868b;">News temporarily unavailable. Please tap Refresh.</div>`;
  }
}

// Media Channel Selector
function setMode(mode, element) {
  document.querySelectorAll('.view-selector button').forEach(b => b.classList.remove('active-mode'));
  if (element) element.classList.add('active-mode');

  const views = ['text', 'video', 'live', 'wildlife', 'sports', 'music', 'nasa', 'airport', 'hindu', 'muslim', 'christian', 'law', 'file'];
  views.forEach(v => {
    const el = document.getElementById(`${v}-view`);
    if (el) el.style.display = 'none';
  });

  const players = {
    video: { id: 'news-video-player', src: 'https://www.youtube.com/embed/II_m28Bm-iM?autoplay=1&mute=1', title: 'News Live' },
    live: { id: 'tc-live-player', src: 'https://www.youtube.com/embed/IzOOvR-XzAg?autoplay=1&mute=1', title: 'T&C Zone Live' },
    wildlife: { id: 'wildlife-player', src: 'https://www.youtube.com/embed/MiQe9ob9aDc?autoplay=1&mute=1', title: 'Wild Safari Live' },
    sports: { id: 'sports-player', src: 'https://www.youtube.com/embed/fE_xxKiCHO0?autoplay=1&mute=1', title: 'Sports Broadcast' },
    music: { id: 'music-player', src: 'https://www.youtube.com/embed/VdG_RC1POC8?autoplay=1&mute=1', title: 'Music & Vibes' },
    nasa: { id: 'nasa-player', src: 'https://www.youtube.com/embed/OKQEMp2555A?autoplay=1&mute=1', title: 'NASA Earth Stream' },
    airport: { id: 'airport-player', src: 'https://www.youtube.com/embed/n4I0d44oBEs?autoplay=1&mute=1', title: 'Airport Airside Live' },
    hindu: { id: 'hindu-player', src: 'https://www.youtube.com/embed/FFtPSPByBmk?autoplay=1&mute=1', title: 'Bhagavad Gita' },
    muslim: { id: 'muslim-player', src: 'https://www.youtube.com/embed/_1FpcN1U_KY?autoplay=1&mute=1', title: 'Holy Quran' },
    christian: { id: 'christian-player', src: 'https://www.youtube.com/embed/dmgsOBr2lAA?autoplay=1&mute=1', title: 'Holy Bible' },
    law: { id: 'law-player', src: 'https://www.youtube.com/embed/U71NrLiWWjI?autoplay=1&mute=1', title: 'Constitution & Law' },
    file: { id: null, src: null, title: 'Media Showcase' }
  };

  const titleEl = document.getElementById('current-channel-title');
  const dotEl = document.getElementById('live-indicator');
  const ticker = document.getElementById('headphones-ticker');

  const selected = document.getElementById(`${mode}-view`);
  if (selected) selected.style.display = 'block';

  if (mode === 'text') {
    if (titleEl) titleEl.innerText = "Headlines";
    if (dotEl) dotEl.style.display = "none";
    if (ticker) ticker.style.display = "none";
  } else {
    const config = players[mode];
    if (titleEl && config) titleEl.innerText = config.title;
    if (dotEl) dotEl.style.display = "inline-block";
    if (config && config.id) {
      const p = document.getElementById(config.id);
      if (p) p.src = config.src;
    }
    if (ticker) ticker.style.display = "flex";
  }
}

function changeLang(lang) {
  const combo = document.querySelector('.goog-te-combo');
  if (combo) {
    combo.value = lang;
    combo.dispatchEvent(new Event('change'));
  }
}

async function fetchWeather() {
  const apiKey = '238416beb1e4e9ee3e1c4c8f16fc2a2c';
  const city = 'Hyderabad';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const temp = `${Math.round(data.main.temp)}°C`;
    const cond = data.weather[0].description;
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    ['desktop-temp', 'mobile-temp'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerText = temp;
    });

    ['desktop-condition'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerText = cond;
    });

    ['desktop-icon', 'mobile-icon'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.src = iconUrl;
    });
  } catch (err) {}
}

// Master Initialization
document.addEventListener("DOMContentLoaded", () => {
  const mapDivEl = document.getElementById('map');
  if (mapDivEl && typeof L !== 'undefined') {
    map = L.map('map').setView([stallLat, stallLng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: 'Tasty & Comfort'
    }).addTo(map);

    L.marker([stallLat, stallLng]).addTo(map)
      .bindPopup('<b>Tasty &amp; Comfort Stall</b><br>New Modern Mission').openPopup();

    seismicLayerGroup = L.layerGroup().addTo(map);
    loadLiveUSGSEarthquakes();

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
  }

  // Welcome Alert
  const closeButton = document.getElementById('apple-alert-close-btn');
  const popupOverlay = document.getElementById('apple-alert-overlay');
  const hasShown = sessionStorage.getItem('menuPopupShown');
  
  if (!hasShown && popupOverlay) {
    popupOverlay.classList.remove('hidden');
    sessionStorage.setItem('menuPopupShown', 'true');
  }
  
  if (closeButton && popupOverlay) {
    closeButton.addEventListener('click', () => popupOverlay.classList.add('hidden'));
  }

  // Headphone notice ticker dismissal
  const ticker = document.getElementById('headphones-ticker');
  if (ticker) {
    ticker.addEventListener('click', () => ticker.style.display = 'none');
  }

  fetchWeather();
  setInterval(fetchWeather, 600000);
  fetchNews();
  checkAnnouncement();
  setInterval(checkAnnouncement, 60000);
});
